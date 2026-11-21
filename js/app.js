const URL_API = "https://rickandmortyapi.com/api/episode";
const CLAVE_STORAGE = "ultimaBusquedaEpisodios";
const formulario = document.querySelector("#formulario-busqueda");
const campoNombre = document.querySelector("#campo-nombre");
const campoTemporada = document.querySelector("#campo-temporada");
const botonBuscar = document.querySelector("#boton-buscar");
const mensaje = document.querySelector("#mensaje");
const contenedorResultados = document.querySelector("#resultados");

const textoOpcional = (valor) => {
  if (valor === undefined || valor === null) return "Desconocido";
  const texto = String(valor).trim();
  if (texto === "" || texto.toLowerCase() === "unknown") return "Desconocido";
  return texto;
};

const mostrarMensaje = (texto, esError = false) => {
  mensaje.textContent = texto;
  mensaje.classList.toggle("mensaje--error", esError);
};

const limpiarResultados = () => {
  contenedorResultados.replaceChildren();
};

const bloquearBusqueda = (bloqueado) => {
  botonBuscar.disabled = bloqueado;
};

const pedirEpisodios = async (nombre, temporada) => {
  const url = new URL(URL_API);
  if (nombre) url.searchParams.set("name", nombre);
  if (temporada) url.searchParams.set("episode", temporada);

  const respuesta = await fetch(url);

  if (respuesta.status === 404) return [];
  if (!respuesta.ok) {
    throw new Error(`La API respondió con el código ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  return datos.results;
};

const crearDato = (etiqueta, valor) => {
  const parrafo = document.createElement("p");
  parrafo.className = "tarjeta__dato";

  const negrita = document.createElement("strong");
  negrita.textContent = `${etiqueta}: `;

  parrafo.append(negrita, document.createTextNode(valor));
  return parrafo;
};

const crearTarjeta = (episodio) => {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta";

  const titulo = document.createElement("h2");
  titulo.className = "tarjeta__titulo";
  titulo.textContent = textoOpcional(episodio.name);

  const cantidadPersonajes = Array.isArray(episodio.characters)
    ? String(episodio.characters.length)
    : "Desconocido";

  tarjeta.append(
    titulo,
    crearDato("Episodio", textoOpcional(episodio.episode)),
    crearDato("Emisión", textoOpcional(episodio.air_date)),
    crearDato("Personajes", cantidadPersonajes)
  );

  return tarjeta;
};

const mostrarTarjetas = (episodios) => {
  limpiarResultados();
  const tarjetas = episodios.map(crearTarjeta);
  contenedorResultados.append(...tarjetas);
};

const guardarBusqueda = (nombre, temporada) => {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify({ nombre, temporada }));
};

const leerBusquedaGuardada = () => {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
};

const buscar = async (nombre, temporada) => {
  if (!nombre && !temporada) {
    limpiarResultados();
    mostrarMensaje("Escribe un nombre o elige una temporada para buscar.", true);
    return;
  }

  bloquearBusqueda(true);
  mostrarMensaje("Buscando…");
  limpiarResultados();

  try {
    const episodios = await pedirEpisodios(nombre, temporada);
    guardarBusqueda(nombre, temporada);

    if (episodios.length === 0) {
      mostrarMensaje("Sin resultados para tu búsqueda.");
      return;
    }

    mostrarTarjetas(episodios);
    mostrarMensaje(`Se encontraron ${episodios.length} episodio(s).`);
  } catch (error) {
    console.warn("Error al buscar episodios:", error.message);
    mostrarMensaje("Ocurrió un error al buscar. Revisa tu conexión e intenta de nuevo.", true);
  } finally {
    bloquearBusqueda(false);
  }
};

const manejarEnvio = (evento) => {
  evento.preventDefault();
  buscar(campoNombre.value.trim(), campoTemporada.value);
};

const restaurarUltimaBusqueda = () => {
  const guardada = leerBusquedaGuardada();
  if (!guardada) return;

  campoNombre.value = guardada.nombre ?? "";
  campoTemporada.value = guardada.temporada ?? "";
  buscar(campoNombre.value.trim(), campoTemporada.value);
};

formulario.addEventListener("submit", manejarEnvio);
restaurarUltimaBusqueda();
