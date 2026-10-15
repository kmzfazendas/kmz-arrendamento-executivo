# KMZ Fazendas — Análise de Arrendamento de Cana

Dashboard web estático. **Não precisa de Google Apps Script, banco de dados, API, login ou servidor próprio.**

## Arquivos que devem ser enviados ao GitHub

- `index.html` — tela, estrutura e modelo A4 do relatório
- `styles.css` — estilo responsivo
- `calc.js` — cálculos financeiros locais
- `scripts.js` — atualização instantânea e função Gerar PDF
- `logo-kmz.png` — imagem original da KMZ Fazendas, **não modificar**
- `.nojekyll` — desativa processamento Jekyll

## Publicação

1. Acesse https://github.com/new e entre com sua conta.
2. Crie repositório **Public** chamado `kmz-arrendamento-executivo` (ou outro nome novo).
3. Clique em **Add file → Upload files**. **Descompacte este ZIP antes** e envie os cinco arquivos `index.html`, `styles.css`, `calc.js`, `scripts.js` e `logo-kmz.png` juntos. Pode enviar também o manual `LEIA-ME_GITHUB.md` e `.nojekyll` (opcional). Não envie o ZIP sozinho!
4. Clique em **Commit changes**.
5. Vá em **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Selecione **main** e **/(root)**, depois **Save**.
6. Aguarde o endereço ser exibido em **Settings → Pages → Visit site**. Exemplo (só se a conta for `kmzfazendas`): `https://kmzfazendas.github.io/kmz-arrendamento-executivo/`.

### Alterações futuras

Altere um arquivo no repositório em **Code → arquivo → lápis (Edit this file) → Commit changes**. O Pages republica sem exigir um link diferente.

## Uso e PDF

Insira os dados e confira os indicadores. Clique **GERAR PDF**. A nova aba mostra o relatório A4 e abre a caixa de impressão; se não abrir automaticamente (principalmente no iPhone), use **IMPRIMIR / SALVAR PDF** na nova aba.

No computador, em Destino selecione **Salvar como PDF**, papel **A4**, escala **100%**, margens **Nenhuma**, habilite **Gráficos de segundo plano** e desabilite **Cabeçalhos e rodapés** se o navegador oferecer essas opções.

No iPhone, use a folha de compartilhamento da visualização de impressão para salvar em **Arquivos**, conforme as opções disponíveis no Safari.

## Verificação rápida (valores ilustrativos Santa Inês)

- Área total: `100`; preço por alqueire: `180.000,00`; arrendada: `80`
- Produtividade: `55`; ATR: `121,19`; preço ATR: `1,2000`
- Patrimônio: `R$ 18.000.000,00`; renda anual `R$ 639.883,20`; mensal `R$ 53.323,60`; ROI `3,55%`
- Seleção 6 anos: receita acumulada `R$ 3.839.299,20`
- Teste uma área arrendada de 120 (para área total de 100): deve aparecer uma mensagem de validação e o botão deve ficar desabilitado.

## Segurança e limites

- Parâmetros digitados são calculados localmente no navegador e **não são enviados ao GitHub**.
- O código do site e a logomarca **ficam públicos**; não publique dados reais de negócios ou matrículas dentro dos arquivos do repositório.
- O relatório é uma simulação indicativa bruta, não um laudo formal ou avaliação de investimento.
- GitHub Pages tem regras próprias para hospedagem e não deve ser tratado como infraestrutura garantida para software comercial/SaaS. Veja: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
