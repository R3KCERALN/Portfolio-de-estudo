// =======================================
// ENDPOINTS DA API (PHP)
// =======================================

const CONTATO_ENDPOINT = "api/contato.php";
const LISTAR_CONTATOS_ENDPOINT = "api/contatos_listar.php";
const ATUALIZAR_CONTATO_ENDPOINT = "api/contato_atualizar.php";
const DELETAR_CONTATO_ENDPOINT = "api/contato_deletar.php";

console.log("main.js carregado (versão sem alert/confirm)");

// =======================================
// Destacar link ativo do menu
// =======================================

function destacarLinkAtivo() {
  const navLinks = document.querySelectorAll("nav a");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("nav-active");
    }
  });
}

// =======================================
// Scroll suave para âncoras internas (#)
// =======================================

function habilitarScrollSuave() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  if (!anchors.length) return;

  anchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      const targetEl = document.querySelector(targetId);

      if (!targetEl) return;

      event.preventDefault();
      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
}

// =======================================
// Atualizar ano do rodapé automaticamente
// =======================================

function atualizarAnoRodape() {
  const currentYear = new Date().getFullYear();

  document.querySelectorAll("footer p").forEach((p) => {
    if (/\d{4}/.test(p.textContent)) {
      p.textContent = p.textContent.replace(/\d{4}/, currentYear);
    }
  });
}

// =======================================
// Animação dos cards de cases
// =======================================

function animarCardsDeCases() {
  const caseCards = document.querySelectorAll(".case");

  if (!caseCards.length || !("IntersectionObserver" in window)) return;

  // marca os cards que vão ter animação
  caseCards.forEach((card) => card.classList.add("case-observe"));

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("case-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  caseCards.forEach((card) => observer.observe(card));
}

// =======================================
// Efeito de "aperto" em botões e links do menu
// =======================================

function habilitarEfeitoPress() {
  const clickable = document.querySelectorAll("button, nav a");
  if (!clickable.length) return;

  clickable.forEach((el) => {
    el.addEventListener("mousedown", () => {
      el.classList.add("btn-press");
    });

    el.addEventListener("mouseup", () => {
      el.classList.remove("btn-press");
    });

    el.addEventListener("mouseleave", () => {
      el.classList.remove("btn-press");
    });
  });
}

// =======================================
// Helpers de feedback visual do formulário
// =======================================

function obterElementoStatusContato() {
  let statusEl = document.getElementById("contato-status");

  // se não existir no HTML por algum motivo, cria dinamicamente
  if (!statusEl) {
    const formContato = document.getElementById("form-contato");
    if (!formContato) return null;

    statusEl = document.createElement("p");
    statusEl.id = "contato-status";
    statusEl.className = "status-mensagem";
    formContato.parentNode.insertBefore(statusEl, formContato.nextSibling);
  }

  return statusEl;
}

function exibirStatusContato(mensagem, tipo) {
  const statusEl = obterElementoStatusContato();
  if (!statusEl) return;

  statusEl.textContent = mensagem || "";
  statusEl.classList.remove("status-sucesso", "status-erro");

  if (tipo === "sucesso") {
    statusEl.classList.add("status-sucesso");
  } else if (tipo === "erro") {
    statusEl.classList.add("status-erro");
  }
}

// =======================================
// Formulário de contato (CREATE)
// =======================================

async function enviarContatoParaServidor(dados) {
  try {
    const resposta = await fetch(CONTATO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const texto = await resposta.text();
    console.log("Resposta bruta do backend:", texto);

    let json;
    try {
      json = JSON.parse(texto);
    } catch (e) {
      // PHP retornou algo que não é JSON (HTML de erro, por exemplo)
      return {
        ok: resposta.ok,
        json: null,
        raw: texto,
      };
    }

    return {
      ok: resposta.ok && json.success !== false,
      json,
      raw: texto,
    };
  } catch (erro) {
    console.error("Erro ao tentar chamar o backend:", erro);
    return {
      ok: false,
      json: null,
      raw: null,
      error: erro,
    };
  }
}

function inicializarFormularioContato() {
  const formContato = document.getElementById("form-contato");
  if (!formContato) return; // não está na index

  formContato.addEventListener("submit", async (event) => {
    event.preventDefault();

    const dados = {
      nome: formContato.nome.value.trim(),
      email: formContato.email.value.trim(),
      telefone: formContato.telefone.value.trim(),
      mensagem: formContato.mensagem.value.trim(),
    };

    // Validação simples no front
    if (!dados.nome || !dados.email || !dados.mensagem) {
      exibirStatusContato(
        "Preencha pelo menos nome, e-mail e mensagem.",
        "erro"
      );
      return;
    }

    // Validação simples de formato de e-mail
    const emailBasicoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailBasicoRegex.test(dados.email)) {
      exibirStatusContato("Digite um e-mail válido.", "erro");
      return;
    }

    exibirStatusContato("Enviando sua mensagem...", null);

    const resposta = await enviarContatoParaServidor(dados);

    if (!resposta.ok) {
      exibirStatusContato(
        "Não foi possível enviar sua mensagem. Tente novamente mais tarde.",
        "erro"
      );
      return;
    }

    let mensagemSucesso = "Mensagem enviada com sucesso!";
    if (resposta.json && resposta.json.message) {
      mensagemSucesso = resposta.json.message;
    }

    exibirStatusContato(mensagemSucesso, "sucesso");
    formContato.reset();
  });
}

// =======================================
// ADMIN: funções para CRUD de contatos
// =======================================

// ---- READ: buscar lista de contatos ----

async function buscarContatosDoServidor() {
  try {
    const resposta = await fetch(LISTAR_CONTATOS_ENDPOINT);
    const json = await resposta.json();

    if (!resposta.ok || !json.success) {
      throw new Error(json.message || "Erro ao listar contatos");
    }

    return json.data || [];
  } catch (erro) {
    console.error("Erro ao buscar contatos:", erro);
    // usuário só vê a tabela vazia
    return [];
  }
}

function preencherTabelaContatos(contatos) {
  const tbody = document.querySelector("#tabela-contatos tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  contatos.forEach((contato) => {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = contato.id;

    const tdNome = document.createElement("td");
    tdNome.textContent = contato.nome;

    const tdEmail = document.createElement("td");
    tdEmail.textContent = contato.email;

    const tdTelefone = document.createElement("td");
    tdTelefone.textContent = contato.telefone || "-";

    const tdMensagem = document.createElement("td");
    tdMensagem.textContent = contato.mensagem;

    const tdAcoes = document.createElement("td");

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.type = "button";

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.type = "button";
    btnExcluir.style.marginLeft = "0.5rem";

    // ação de editar
    btnEditar.addEventListener("click", () => {
      carregarContatoNoFormulario(contato);
    });

    // ação de excluir (sem confirm)
    btnExcluir.addEventListener("click", async () => {
      console.log(`Excluindo contato ID ${contato.id} (${contato.nome})`);
      await excluirContato(contato.id);
      const contatosAtualizados = await buscarContatosDoServidor();
      preencherTabelaContatos(contatosAtualizados);
    });

    tdAcoes.appendChild(btnEditar);
    tdAcoes.appendChild(btnExcluir);

    tr.appendChild(tdId);
    tr.appendChild(tdNome);
    tr.appendChild(tdEmail);
    tr.appendChild(tdTelefone);
    tr.appendChild(tdMensagem);
    tr.appendChild(tdAcoes);

    tbody.appendChild(tr);
  });
}

// ---- Carregar dados no formulário de edição ----

function carregarContatoNoFormulario(contato) {
  const formEditar = document.getElementById("form-editar-contato");
  if (!formEditar) return;

  formEditar["id"].value = contato.id;
  formEditar["nome"].value = contato.nome;
  formEditar["email"].value = contato.email;
  formEditar["telefone"].value = contato.telefone || "";
  formEditar["mensagem"].value = contato.mensagem || "";
}

// ---- UPDATE: atualizar contato ----

async function atualizarContato(dados) {
  try {
    const resposta = await fetch(ATUALIZAR_CONTATO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const json = await resposta.json();

    if (!resposta.ok || !json.success) {
      throw new Error(json.message || "Erro ao atualizar contato");
    }

    console.log(json.message || "Contato atualizado com sucesso!");
  } catch (erro) {
    console.error("Erro ao atualizar contato:", erro);
  }
}

// ---- DELETE: excluir contato ----

async function excluirContato(id) {
  try {
    const resposta = await fetch(DELETAR_CONTATO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const json = await resposta.json();

    if (!resposta.ok || !json.success) {
      throw new Error(json.message || "Erro ao excluir contato");
    }

    console.log(json.message || "Contato excluído com sucesso!");
  } catch (erro) {
    console.error("Erro ao excluir contato:", erro);
  }
}

// ---- Inicializar lógica da página admin ----

function inicializarAdminContatos() {
  const tabela = document.getElementById("tabela-contatos");
  const formEditar = document.getElementById("form-editar-contato");

  // se não estiver na página admin, não faz nada
  if (!tabela) return;

  // carrega contatos ao abrir a página
  (async () => {
    const contatos = await buscarContatosDoServidor();
    preencherTabelaContatos(contatos);
  })();

  if (formEditar) {
    formEditar.addEventListener("submit", async (event) => {
      event.preventDefault();

      const dados = {
        id: Number(formEditar["id"].value),
        nome: formEditar["nome"].value.trim(),
        email: formEditar["email"].value.trim(),
        telefone: formEditar["telefone"].value.trim(),
        mensagem: formEditar["mensagem"].value.trim(),
      };

      if (!dados.id || !dados.nome || !dados.email || !dados.mensagem) {
        console.warn("Preencha todos os campos obrigatórios antes de salvar.");
        return;
      }

      await atualizarContato(dados);

      const contatosAtualizados = await buscarContatosDoServidor();
      preencherTabelaContatos(contatosAtualizados);
    });
  }
}

// =======================================
// INICIALIZAÇÃO GERAL
// =======================================

document.addEventListener("DOMContentLoaded", () => {
  destacarLinkAtivo();
  habilitarScrollSuave();
  atualizarAnoRodape();
  animarCardsDeCases();
  habilitarEfeitoPress();
  inicializarFormularioContato(); // Home (CREATE)
  inicializarAdminContatos();     // Admin (READ/UPDATE/DELETE)
});
