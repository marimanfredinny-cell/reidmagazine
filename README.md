# REID Magazine

Site institucional da REID Magazine — revista digital cultural de Portugal.

Site estático, sem build. É só abrir `index.html` ou servir a pasta.

```
index.html
assets/
  styles.css      identidade visual (papel cru, grafite, dourado)
  main.js         menu mobile, entrada suave das seções, formulário
  logo-mark.svg   desenho da Ponte 25 de Abril + Torre de Belém
  favicon.svg
  img/            fotos das editorias e da galeria
```

## Últimas publicações do Instagram

O carrossel do rodapé lê `assets/instagram.json`. O Instagram não serve o
feed de um perfil sem autenticação, então as publicações são listadas ali
à mão — trocar o ficheiro troca o que aparece no site.

```json
{
  "publicacoes": [
    {
      "imagem": "assets/img/nome-do-ficheiro.jpg",
      "link": "https://www.instagram.com/p/CODIGO_DO_POST/",
      "legenda": "A frase que aparece por cima da foto"
    }
  ]
}
```

A ordem da lista é a ordem no site: a publicação mais recente primeiro.
A imagem precisa estar em `assets/img/`; o link é o endereço do post, que
se copia no próprio Instagram em **Copiar ligação**. Se o ficheiro faltar
ou vier vazio, o carrossel simplesmente não aparece e o rodapé segue
inteiro.

As três entradas que estão lá agora são provisórias, para o carrossel ter
o que mostrar. **Trocar antes de pôr o site no ar.**

## Números de alcance

Os números da seção `#alcance` vêm dos insights do Instagram, janela de 27
de julho a 26 de agosto de 2026. Ao atualizar, mexer também na chamada do
formulário e no segundo parágrafo da seção "O que é a REID" — os mesmos
números aparecem nos três lugares.

## Formulário

Hoje o formulário monta a mensagem e abre o programa de e-mail do visitante
já preenchido, com destino `Contato@reidmagazine.pt`.

Pra receber os pedidos direto na caixa de entrada, sem depender do programa
de e-mail do visitante, é só dar um endereço de serviço ao formulário
(Formspree, Basin, Getform ou equivalente):

```html
<form id="reid-form" action="https://formspree.io/f/SEU_ID" method="POST" novalidate>
```

O `main.js` já detecta o `action` e passa a enviar por lá, com mensagem de
erro e o mesmo texto de confirmação ("Recebemos. A REID vai analisar o seu
trabalho e entra em contato em breve.").
