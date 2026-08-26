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
  var targets = document.querySelectorAll('.section-head, .col-body, .card, .number, .panel, .quem-media, .quem-text, .hero-text > *');
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
