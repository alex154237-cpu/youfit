# YOUFIT — vista seu mood

Web app em português com interface dedicada a celulares e tablets. Em telas grandes, mantém uma superfície de aplicativo de até 900 px, sem navegação de desktop.

## Rodar

Requer Node.js 22.13 ou superior (a implementação usa `node:sqlite`; validada com Node 26).

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

Abra **http://127.0.0.1:4174** no computador. O Google é opcional para testar: o cadastro e o login por e-mail já funcionam. O modo exploração usa IndexedDB e não exige conta. A prévia local não é uma publicação na internet.

## Teste pelo celular na mesma rede

O computador e o celular precisam estar no mesmo Wi-Fi. Para iniciar uma prévia de rede sem substituir a prévia do computador, execute no PowerShell, nesta pasta:

```powershell
$env:HOST='0.0.0.0'
$env:PORT='4175'
$env:APP_ORIGIN='http://IP-DO-COMPUTADOR:4175'
node --use-system-ca server.mjs
```

Abra `http://IP-DO-COMPUTADOR:4175/#login` no navegador do celular. Substitua `IP-DO-COMPUTADOR` pelo IPv4 do computador, consultando `ipconfig`. Atualize `APP_ORIGIN` e o endereço acessado quando a rede mudar. Mantenha o computador ligado e o processo ativo. Se o Windows solicitar acesso à rede, permita apenas na rede privada de teste. Não há publicação na internet. Google OAuth continua exigindo sua configuração própria; esta prévia serve para testar e-mail, peças, galeria e captura pelo seletor nativo.

Em Fotografar, toque em Câmera: o campo usa `capture="environment"` para solicitar a câmera traseira. O navegador pode oferecer um seletor com a opção de tirar foto. No computador, é normal abrir apenas o seletor de arquivos. A captura em um celular físico ainda precisa ser confirmada. O gerador de IDs tem alternativa a `crypto.randomUUID` para salvar fotos mesmo no HTTP da rede local.

## O que está implementado

- Telas de login e cadastro; navegação inferior com Looks, Armário, Favoritos e Perfil.
- Cadastro por e-mail/senha, sessão no servidor e saída da conta.
- Senhas com scrypt e salt; cookies HttpOnly/SameSite, token CSRF, validação da origem, limite de tentativas e isolamento dos registros por usuário.
- SQLite persistente em `data/youfit.sqlite`: usuários, sessões, guarda-roupas e catálogo.
- Câmera e galeria como entradas independentes; compressão no navegador até 800 px.
- Classificação manual por categoria, cor e estilos; combinações por regras.
- Catálogo inicial de **sete peças reais**, com fotos hospedadas junto do app. Nenhuma imagem foi gerada por IA ou recolorida. Os créditos e as licenças ficam em `dist/assets/credits.json` e na tela do catálogo.
- Adição de peças do catálogo ao armário, busca, filtros, favoritos e exportação de backup.
- Dados da conta no servidor; demonstração isolada no navegador. Os exemplos ilustrados da versão anterior são migrados para as fotos disponíveis sem apagar as peças enviadas pelo usuário.

## Ativar Google depois

A integração é opcional e precisa de configuração no Google Cloud. Sem `GOOGLE_CLIENT_ID`, nenhum login Google é simulado: o botão explica a pendência e o Google Fotos fica indisponível. E-mail e galeria continuam funcionando.

1. Crie um projeto no Google Cloud e configure a identidade visual e a tela de consentimento OAuth.
2. Crie um cliente OAuth do tipo **Aplicativo da Web**. Configure as origens JavaScript autorizadas para o domínio real e para a origem de teste. Siga o [guia oficial de configuração do login](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).
   Para testar o Google, prefira `http://localhost:4174`, cadastre essa origem no console, ajuste `APP_ORIGIN` para o mesmo endereço e abra o app por esse endereço. Não alterne entre localhost e 127.0.0.1 durante a sessão.
3. Habilite a **Google Photos Picker API** e autorize o escopo `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`. Configure os usuários de teste e a verificação exigida pelo Google para uso público.
4. Preencha `GOOGLE_CLIENT_ID` no arquivo `.env` e reinicie o servidor. Este fluxo usa apenas o ID público, sem client secret ou chave privada no navegador.
5. Teste login, criação de uma nova conta Google, cancelamento do consentimento e seleção de fotos no domínio autorizado antes de liberar para usuários.

### Fluxo implementado

O login usa Google Identity Services, com botão oficial quando configurado. O servidor valida o ID token com `google-auth-library`, checando assinatura, audiência, emissor, expiração e nonce. A identidade Google é vinculada por `sub`. Uma conta existente por e-mail não é vinculada automaticamente apenas pela coincidência do endereço.

O acesso a fotos é uma autorização separada, acionada pela pessoa. O seletor permite escolher até 20 fotos. O servidor cria a sessão, consulta a seleção, lista os itens e baixa apenas as imagens selecionadas com o token de acesso. O usuário classifica cada foto antes de adicioná-la ao armário. O token fica temporariamente na memória do servidor, ligado à sessão do usuário, e não é gravado no SQLite ou no armazenamento do navegador. A sessão do Picker é removida após importação ou cancelamento; ao expirar, o token é descartado. Fechar o seletor limpa a sessão local, mas não revoga permanentemente a autorização na conta Google.

Não há leitura indiscriminada da biblioteca ou sincronização automática de álbuns. O funcionamento segue a [Google Photos Picker API](https://developers.google.com/photos/picker/reference/rest) e a [autorização por token](https://developers.google.com/identity/oauth2/web/guides/use-token-model). O fluxo com o Google real **ainda não foi validado**, pois o projeto OAuth não foi criado.

## Publicação online

Esta versão precisa do **servidor Node**, e não apenas de hospedagem estática. Configure um domínio HTTPS, proxy para o Node, `APP_ORIGIN` igual à origem pública, `NODE_ENV=production` e um volume persistente para `data/`. Cookies usam Secure em produção. O bind local padrão é `127.0.0.1`; ajuste `HOST` conforme a hospedagem. Faça backup do SQLite e dos respectivos arquivos WAL/SHM com um método de backup consistente do SQLite.

O repositório contém o código do aplicativo. Publicar o código no GitHub não coloca o servidor online; a hospedagem precisa ser configurada separadamente.

## Validação e limites

```powershell
npm test
```

Os testes verificam combinações completas por categoria e estilo, IDs únicos, prioridade de resultados, cadastro, credenciais inválidas, isolamento das contas, validação de peças, persistência durante a sessão, logout, CSRF e estado de integração não configurada.

Validação no navegador: cadastro por e-mail, adição de três peças reais, geração do look rock, favoritos, upload de foto da galeria, salvamento na conta, estado de Google Fotos não configurado e layouts de celular e tablet. Registros visuais em `test-results/`. Câmera física e OAuth real precisam ser testados em dispositivos reais e no domínio HTTPS.

A classificação das fotos ainda é manual. Recuperação de senha por e-mail, verificação do e-mail, importação do backup, edição de peças e infraestrutura de produção para alta escala não estão implementadas. O armário aceita até 200 peças e 1.000 favoritos, com limite de 30 MB por salvamento. O catálogo de sete peças é uma base demonstrativa licenciada, não um catálogo comercial completo. As fontes usam Google Fonts, com fontes locais como alternativa.
