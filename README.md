# Site pessoal e blog — Thiago Fonseca

Aplicação Node.js com Express para o trabalho de implantação na Oracle Cloud Infrastructure (OCI). O site reúne currículo, experiência, formação, habilidades e um blog cujos artigos são carregados de `data/posts.json` por uma rota HTTP.

## Conteúdo do projeto

- `server.js`: servidor Express, API do blog e endpoint de saúde.
- `public/`: site responsivo em HTML, CSS e JavaScript.
- `data/posts.json`: artigos iniciais; pode ser editado sem alterar o servidor.
- `ecosystem.config.js`: configuração do processo para PM2.

O servidor escuta em `0.0.0.0` na porta `3000` (ou na porta definida pela variável `PORT`).

## Antes de publicar

Edite `public/index.html` e substitua `SEU_EMAIL@EXEMPLO.COM`, além dos links genéricos do LinkedIn e GitHub, pelos seus dados reais. Confira também as informações do currículo. Os artigos podem ser alterados em `data/posts.json`, mantendo os campos `title`, `date` (formato `AAAA-MM-DD`), `category`, `excerpt` e `body`.

## 1. Criar a instância OCI

No Console OCI:

1. Crie uma instância Compute **Always Free**, por exemplo Ubuntu Server 22.04/24.04 em `VM.Standard.E2.1.Micro` (AMD) ou `VM.Standard.A1.Flex` (Ampere, se houver capacidade).
2. Associe uma VCN e uma sub-rede pública. Configure uma regra **Ingress** TCP para a porta `22` (SSH) e outra TCP para `3000` (site). Para SSH, restrinja a origem ao IP do professor e ao seu IP quando isso for possível. A porta 80 só é necessária se você configurar um proxy reverso.
3. Reserve e associe um endereço IPv4 público reservado/fixo para usar no formulário de entrega.
4. Guarde sua chave privada SSH em local seguro. **Não envie nem publique a chave privada.**

A regra de entrada da VCN e o firewall dentro do Linux precisam permitir as portas usadas. Uma regra de rede na OCI, por si só, não altera o UFW do sistema.

## 2. Preparar Ubuntu e firewall

Conecte-se com sua chave privada e o usuário padrão `ubuntu`:

```bash
ssh -i /caminho/para/sua-chave ubuntu@IP_PUBLICO
```

Instale Git, Node.js 22 e PM2:

```bash
sudo apt update
sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node --version
npm --version
pm2 --version
```

Libere SSH e a porta do site no firewall local:

```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp
sudo ufw enable
sudo ufw status
```

Confirme também que as regras **Ingress** da VCN permitem TCP 22 e TCP 3000. Não publique a porta do MongoDB ou qualquer banco de dados.

## 3. Publicar o código

Crie um repositório GitHub/GitLab para este projeto. Depois de subir o código ao repositório, na instância execute:

```bash
sudo mkdir -p /var/www/thiago-site
sudo chown ubuntu:ubuntu /var/www/thiago-site
cd /var/www/thiago-site
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git .
npm install --omit=dev
```

Se preferir transferir o código diretamente, envie os arquivos ao servidor com `scp` ou `rsync` e execute os mesmos comandos de instalação dentro da pasta do projeto. Não envie `.env`, senhas ou chaves privadas ao repositório.

## 4. Iniciar e persistir pelo PM2

Na pasta `/var/www/thiago-site`:

```bash
pm2 start ecosystem.config.js
pm2 list
pm2 status
pm2 startup
```

O comando `pm2 startup` exibirá uma linha específica para o usuário `ubuntu`; copie e execute exatamente a linha impressa. Em seguida, salve a lista de processos:

```bash
pm2 save
```

Para atualizar a aplicação depois de um novo envio ao repositório:

```bash
cd /var/www/thiago-site
git pull
npm install --omit=dev
pm2 restart thiago-site-pessoal
pm2 save
```

O site deverá responder em `http://IP_PUBLICO:3000`. O endpoint `http://IP_PUBLICO:3000/health` deve retornar JSON com `"status":"ok"`.

## 5. Configurar a chave SSH do professor

A chave pública fornecida no enunciado pode ser adicionada ao usuário `ubuntu`. Faça isso somente na instância criada para o trabalho:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
printf '%s\n' 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH+9NKQIFuqVIH6BiFv7Mkr87JG6KiFon2gv+yi90OhG professor-avaliacao-oci' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

O usuário padrão `ubuntu` tem acesso a `sudo` nas imagens Ubuntu da OCI. Se o professor exigir que `sudo` não solicite senha durante a avaliação, configure isso **temporariamente** e remova ao final. Crie uma regra específica para esse usuário:

```bash
printf '%s\n' 'ubuntu ALL=(ALL) NOPASSWD: ALL' | sudo tee /etc/sudoers.d/90-avaliacao-professor
sudo chmod 440 /etc/sudoers.d/90-avaliacao-professor
sudo visudo -cf /etc/sudoers.d/90-avaliacao-professor
```

Essa opção concede acesso administrativo completo a quem conseguir entrar como `ubuntu`; use-a apenas para a avaliação, mantenha SSH restrito por IP sempre que possível e remova a regra e a chave pública do professor após a correção. Para remover a chave, edite `~/.ssh/authorized_keys` e apague a linha que termina em `professor-avaliacao-oci`. Para remover a regra temporária:

```bash
sudo rm /etc/sudoers.d/90-avaliacao-professor
```

Não compartilhe a sua chave privada com o professor. A chave fornecida no enunciado é uma **chave pública** e é essa linha que deve constar em `authorized_keys`.

## 6. O que entregar

Preencha e envie até **18/11/2026 às 22:00**:

- URL pública: `http://IP_PUBLICO:3000`
- Usuário SSH: `ubuntu`
- Repositório: URL HTTPS do GitHub/GitLab
- Acesso SSH: confirmação de que a chave do professor está em `authorized_keys`
- Saídas de `pm2 list` e `pm2 status`

Exemplo para registrar as saídas no terminal:

```bash
pm2 list
pm2 status
```

## Execução local para edição

Com Node.js 18 ou superior instalado:

```bash
npm install
npm start
```

Acesse `http://localhost:3000`.
