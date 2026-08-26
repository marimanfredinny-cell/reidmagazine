/* REID Magazine — comportamento do site */
(function () {
  'use strict';

  /* ——— ano do rodapé ——— */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ——— menu mobile ——— */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Abrir menu');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) burger.click();
    });
  }

  /* ——— entrada suave das seções ——— */
  var targets = document.querySelectorAll('.section-head, .col-body, .card, .number, .panel, .quem-media, .quem-text');
  if ('IntersectionObserver' in window && targets.length) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }


  /* ——— entrada escalonada do hero, na carga da página ———
     O hero não passa pelo observer: parte dele nasce colada na dobra e
     ficaria invisível até alguém rolar. */
  var heroBits = document.querySelectorAll('.hero-text > *');
  Array.prototype.forEach.call(heroBits, function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (0.09 * i).toFixed(2) + 's';
  });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(heroBits, function (el) { el.classList.add('in'); });
    });
  });

  /* ——— polaroides: a foto de cada editoria troca sozinha ——— */
  var suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Array.prototype.forEach.call(document.querySelectorAll('.shots'), function (caixa, i) {
    var fotos = caixa.querySelectorAll('.shot');
    if (fotos.length < 2 || suave) return;

    var atual = 0;
    var espera = 3800 + i * 1700;   // cada polaroide troca no seu tempo

    setTimeout(function () {
      setInterval(function () {
        // pausa enquanto a seção está fora da tela
        if (document.hidden) return;
        var caixaTopo = caixa.getBoundingClientRect();
        if (caixaTopo.bottom < 0 || caixaTopo.top > window.innerHeight) return;

        fotos[atual].classList.remove('is-on');
        atual = (atual + 1) % fotos.length;
        fotos[atual].classList.add('is-on');
      }, 6000);
    }, espera);
  });

  /* ——— as barras das métricas crescem quando a seção entra na tela ———
     Observa-se o bloco, não cada barra: uma barra nasce com largura zero,
     e um elemento de área zero nunca cruza o threshold do observer. */
  var painel = document.querySelector('.breakdown');
  if (painel) {
    var barras = painel.querySelectorAll('.bar i');
    var encher = function () {
      Array.prototype.forEach.call(barras, function (barra, i) {
        barra.style.transitionDelay = (0.12 * i).toFixed(2) + 's';
        barra.classList.add('is-full');
      });
    };

    if (suave || !('IntersectionObserver' in window)) {
      encher();
    } else {
      var ioPainel = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          encher();
          ioPainel.disconnect();
        });
      }, { threshold: 0.25 });
      ioPainel.observe(painel);
    }
  }

  /* ——— faixa de fotos em movimento contínuo ——— */
  var track = document.getElementById('gallery-track');
  if (track && !suave) {
    var copia = track.cloneNode(true);
    Array.prototype.forEach.call(copia.children, function (img) {
      img.setAttribute('aria-hidden', 'true');
      img.setAttribute('alt', '');
    });
    while (copia.firstChild) track.appendChild(copia.firstChild);
  }

  /* ——— últimas publicações do Instagram ———
     O Instagram não serve o feed de um perfil sem autenticação, então as
     publicações vêm de assets/instagram.json. Trocar aquele ficheiro (à mão
     ou por uma rotina que fale com a API do Meta) troca o que aparece aqui. */
  (function () {
    var secao = document.getElementById('insta');
    var trilho = document.getElementById('insta-trilho');
    if (!secao || !trilho) return;

    /* numa página de ficheiro único os dados vêm embutidos; no site normal,
       do ficheiro ao lado */
    var embutido = document.getElementById('insta-dados');
    var fonte = embutido
      ? Promise.resolve(JSON.parse(embutido.textContent))
      : fetch('assets/instagram.json').then(function (r) {
          return r.ok ? r.json() : Promise.reject();
        });

    fonte
      .then(function (dados) {
        var posts = (dados && dados.publicacoes) || [];
        if (!posts.length) return;

        var utilizador = dados.utilizador || 'reid.magazine';

        posts.forEach(function (post) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.className = 'insta-post';
          a.href = post.link || dados.perfil || '#';
          a.target = '_blank';
          a.rel = 'noopener';
          a.setAttribute('aria-label',
            'Abrir no Instagram: ' + (post.legenda || 'publicação da REID Magazine'));

          a.appendChild(cabecalhoDoPost(utilizador));

          var moldura = document.createElement('span');
          moldura.className = 'insta-arte';
          var img = document.createElement('img');
          img.src = post.imagem;
          img.alt = post.legenda || 'Publicação da REID Magazine no Instagram';
          img.loading = 'lazy';
          moldura.appendChild(img);
          a.appendChild(moldura);

          a.appendChild(rodapeDoPost(utilizador, post.legenda));

          li.appendChild(a);
          trilho.appendChild(li);
        });

        secao.hidden = false;
        montarCarrossel(secao, trilho);
      })
      .catch(function () { /* sem ficheiro, o rodapé fica sem o carrossel */ });
  })();

  function cabecalhoDoPost(utilizador) {
    var topo = document.createElement('span');
    topo.className = 'insta-topo';

    var selo = document.createElement('span');
    selo.className = 'insta-selo';
    selo.textContent = 'R';

    var nome = document.createElement('span');
    nome.className = 'insta-nome';
    nome.textContent = utilizador;

    topo.appendChild(selo);
    topo.appendChild(nome);
    return topo;
  }

  function rodapeDoPost(utilizador, legenda) {
    var base = document.createElement('span');
    base.className = 'insta-base';

    var icones = document.createElement('span');
    icones.className = 'insta-icones';
    icones.setAttribute('aria-hidden', 'true');
    icones.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/></svg>' +
      '<svg viewBox="0 0 24 24"><path d="M21 11.6c0 4-4 7.2-9 7.2a10.6 10.6 0 0 1-2.6-.3L4 20.5l1.5-3.4A6.8 6.8 0 0 1 3 11.6c0-4 4-7.2 9-7.2s9 3.2 9 7.2z"/></svg>' +
      '<svg viewBox="0 0 24 24"><path d="M21.5 3.2 2.8 10.4l6.6 2.3 2.3 6.6 9.8-16.1z"/><path d="m9.4 12.7 4.4-4.4"/></svg>';

    base.appendChild(icones);

    if (legenda) {
      var texto = document.createElement('span');
      texto.className = 'insta-legenda';
      var quem = document.createElement('b');
      quem.textContent = utilizador;
      texto.appendChild(quem);
      texto.appendChild(document.createTextNode(' ' + legenda));
      base.appendChild(texto);
    }

    return base;
  }

  function montarCarrossel(secao, trilho) {
    var palco = secao.querySelector('.insta-palco');
    var esq = secao.querySelector('.insta-seta-esq');
    var dir = secao.querySelector('.insta-seta-dir');
    if (!palco || !esq || !dir) return;

    var passo = function () {
      var item = trilho.querySelector('li');
      if (!item) return trilho.clientWidth;
      var gap = parseFloat(getComputedStyle(trilho).gap) || 0;
      return item.getBoundingClientRect().width + gap;
    };

    var sobra = function () { return trilho.scrollWidth - trilho.clientWidth; };

    var arrumarSetas = function () {
      var temSobra = sobra() > 4;
      palco.classList.toggle('tem-setas', temSobra);
      esq.disabled = trilho.scrollLeft <= 2;
      dir.disabled = trilho.scrollLeft >= sobra() - 2;
    };

    esq.addEventListener('click', function () { trilho.scrollLeft -= passo(); });
    dir.addEventListener('click', function () { trilho.scrollLeft += passo(); });
    trilho.addEventListener('scroll', arrumarSetas, { passive: true });
    window.addEventListener('resize', arrumarSetas);
    arrumarSetas();

    /* passa sozinho, e para assim que alguém toca ou passa o rato */
    if (suave) return;

    var parado = false;
    var pausar = function () { parado = true; };
    var soltar = function () { parado = false; };
    ['pointerenter', 'pointerdown', 'focusin'].forEach(function (evt) {
      palco.addEventListener(evt, pausar);
    });
    ['pointerleave', 'focusout'].forEach(function (evt) {
      palco.addEventListener(evt, soltar);
    });

    setInterval(function () {
      if (parado || document.hidden || sobra() <= 4) return;
      var caixa = secao.getBoundingClientRect();
      if (caixa.bottom < 0 || caixa.top > window.innerHeight) return;

      if (trilho.scrollLeft >= sobra() - 2) trilho.scrollLeft = 0;
      else trilho.scrollLeft += passo();
    }, 5000);
  }

  /* ——— botão do WhatsApp entra depois do hero ——— */
  var zap = document.querySelector('.whatsapp');
  if (zap) {
    var mostrarZap = function () {
      if (window.scrollY > window.innerHeight * 0.45) zap.classList.add('is-ready');
      else zap.classList.remove('is-ready');
    };
    mostrarZap();
    window.addEventListener('scroll', mostrarZap, { passive: true });
  }

  /* ——— formulário ———
     Hoje o pedido é entregue por e-mail: o site monta a mensagem e abre o
     programa de e-mail do visitante com tudo já preenchido.
     Para receber os pedidos direto na caixa de entrada, sem depender do
     programa de e-mail, basta dar ao <form> um action de serviço
     (ex.: Formspree) e method="POST" — o bloco abaixo já trata os dois casos. */
  var DESTINO = 'Contato@reidmagazine.pt';

  var form = document.getElementById('reid-form');
  var errorBox = document.getElementById('form-error');
  var success = document.getElementById('form-success');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    Array.prototype.forEach.call(form.elements, function (el) { el.classList.add('touched'); });

    if (!form.checkValidity()) {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = 'Faltou preencher alguma coisa. Confira os campos marcados e tente de novo.';
      }
      var first = form.querySelector(':invalid');
      if (first) first.focus();
      return;
    }

    if (errorBox) errorBox.hidden = true;

    var data = new FormData(form);
    var get = function (k) { return (data.get(k) || '').toString().trim(); };

    var corpo = [
      'Nome: ' + get('nome'),
      'E-mail: ' + get('email'),
      'Telefone / WhatsApp: ' + get('telefone'),
      'É: ' + get('perfil'),
      'Projeto, casa ou trabalho: ' + get('projeto'),
      'Instagram / site: ' + (get('link') || '—'),
      '',
      'O que quer divulgar:',
      get('mensagem')
    ].join('\n');

    var action = form.getAttribute('action');

    if (action) {
      // Envio por serviço externo (Formspree ou equivalente).
      fetch(action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      }).then(function (r) {
        if (!r.ok) throw new Error('falha no envio');
        mostrarSucesso();
      }).catch(function () {
        if (errorBox) {
          errorBox.hidden = false;
          errorBox.innerHTML = 'Não foi possível enviar agora. Fale direto pelo e-mail <a href="mailto:' +
            DESTINO + '">' + DESTINO + '</a> ou pelo WhatsApp +351 939 820 975.';
        }
      });
      return;
    }

    // Sem action: abre o e-mail já preenchido.
    var assunto = 'Quero aparecer na REID — ' + (get('projeto') || get('nome'));
    window.location.href = 'mailto:' + DESTINO +
      '?subject=' + encodeURIComponent(assunto) +
      '&body=' + encodeURIComponent(corpo);

    mostrarSucesso();
  });

  function mostrarSucesso() {
    form.hidden = true;
    if (errorBox) errorBox.hidden = true;
    if (success) {
      success.hidden = false;
      success.setAttribute('tabindex', '-1');
      success.focus();
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
})();
