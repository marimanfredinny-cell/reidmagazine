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

## O que ainda precisa dos dados reais

1. **Números de alcance** — em `index.html`, seção `#alcance`, trocar
   `[X mil]`, `[alcance médio]` e `[média de visualizações]` pelos números
   do Instagram. O `[X mil]` aparece também na chamada do formulário.
2. **Insights** — a caixa tracejada em `#alcance` (`.insights-slot`) está
   reservada pro print ou gráfico. É só substituir o bloco por
   `<img src="assets/img/insights.jpg" alt="Insights do Instagram">`.

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
