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
