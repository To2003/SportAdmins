export type EstadoDeuda = "pendiente" | "en_revision" | "aprobado" | "rechazado"
export type EstadoRoster = "sin-enviar" | "pendiente" | "aprobado"

export const TORNEO = {
  nombre: "Liga Metropolitana de Vóley Amateur",
  temporada: "Apertura 2026",
  jornadaActual: 4,
}

export function formatARS(n: number): string {
  const abs = Math.abs(n)
  const s = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(abs)
  return n < 0 ? `-${s}` : s
}

export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  })
}

export function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export interface Equipo {
  id: string
  nombre: string
  capitan: string
  telefono: string
  saldo: number // negativo = deudor, 0 = al día, positivo = a favor
  ultimoPago: string
  bloqueado: boolean
  roster: EstadoRoster
}

export const equipos: Equipo[] = [
  { id: "e1", nombre: "Los Topadores", capitan: "Martín Gómez", telefono: "+54 9 11 5123-4567", saldo: -18000, ultimoPago: "2026-06-28", bloqueado: false, roster: "aprobado" },
  { id: "e2", nombre: "Águilas del Sur", capitan: "Lucía Fernández", telefono: "+54 9 11 5987-2210", saldo: 0, ultimoPago: "2026-07-30", bloqueado: false, roster: "aprobado" },
  { id: "e3", nombre: "Vóley Belgrano", capitan: "Diego Suárez", telefono: "+54 9 11 5442-8891", saldo: -36000, ultimoPago: "2026-05-15", bloqueado: true, roster: "pendiente" },
  { id: "e4", nombre: "Halcones de Núñez", capitan: "Sofía Ramírez", telefono: "+54 9 11 5310-7742", saldo: 6000, ultimoPago: "2026-08-01", bloqueado: false, roster: "aprobado" },
  { id: "e5", nombre: "Cóndores VC", capitan: "Nicolás Herrera", telefono: "+54 9 11 5678-1120", saldo: 0, ultimoPago: "2026-07-28", bloqueado: false, roster: "aprobado" },
  { id: "e6", nombre: "Deportivo Liniers", capitan: "Camila Torres", telefono: "+54 9 11 5901-3388", saldo: -9000, ultimoPago: "2026-07-10", bloqueado: false, roster: "pendiente" },
  { id: "e7", nombre: "Punta Alta Vóley", capitan: "Federico Rossi", telefono: "+54 9 11 5223-6677", saldo: -54000, ultimoPago: "2026-04-20", bloqueado: true, roster: "sin-enviar" },
  { id: "e8", nombre: "Los Andes VC", capitan: "Valentina Díaz", telefono: "+54 9 11 5744-9012", saldo: 0, ultimoPago: "2026-07-31", bloqueado: false, roster: "aprobado" },
  { id: "e9", nombre: "Racing de Saque", capitan: "Joaquín Morales", telefono: "+54 9 11 5188-4523", saldo: -12000, ultimoPago: "2026-06-30", bloqueado: false, roster: "pendiente" },
  { id: "e10", nombre: "San Lorenzo Vóley", capitan: "Agustina Ruiz", telefono: "+54 9 11 5622-7789", saldo: 3000, ultimoPago: "2026-08-02", bloqueado: false, roster: "aprobado" },
  { id: "e11", nombre: "Tigres de Caballito", capitan: "Matías Peralta", telefono: "+54 9 11 5399-1102", saldo: -27000, ultimoPago: "2026-05-28", bloqueado: false, roster: "sin-enviar" },
  { id: "e12", nombre: "Villa Crespo VC", capitan: "Florencia Blanco", telefono: "+54 9 11 5470-3341", saldo: 0, ultimoPago: "2026-07-29", bloqueado: false, roster: "aprobado" },
  { id: "e13", nombre: "Estudiantes Vóley", capitan: "Tomás Aguirre", telefono: "+54 9 11 5811-6650", saldo: -6000, ultimoPago: "2026-07-05", bloqueado: false, roster: "pendiente" },
  { id: "e14", nombre: "Defensores del Bloqueo", capitan: "Julieta Sosa", telefono: "+54 9 11 5255-4478", saldo: -45000, ultimoPago: "2026-04-30", bloqueado: true, roster: "sin-enviar" },
]

// ---- Deudas: cargos creados por el admin (inscripción, cuota de partido, cancha, multa, etc.) ----
// Cada deuda pertenece a un solo equipo. Cuando el admin crea un cargo para varios equipos,
// se genera una Deuda independiente por cada uno (mismo concepto y monto, distinto id).
export interface Deuda {
  id: string
  equipoId: string
  concepto: string
  monto: number
  creadoEl: string
  estado: EstadoDeuda
  comprobanteImagen?: string
  comprobanteSubidoEl?: string
  medio?: "transferencia" | "efectivo"
  resueltoEl?: string // fecha en que el admin aprobó/rechazó o registró el pago
}

export const deudasIniciales: Deuda[] = [
  // Los Topadores (e1) — historial completo, usado también en la app del capitán
  { id: "d1", equipoId: "e1", concepto: "Inscripción — Apertura 2026", monto: 36000, creadoEl: "2026-05-01T00:00:00", estado: "aprobado", medio: "efectivo", resueltoEl: "2026-05-03T19:00:00" },
  { id: "d2", equipoId: "e1", concepto: "Fecha 1 — Cuota de partido", monto: 9000, creadoEl: "2026-06-14T00:00:00", estado: "aprobado", medio: "transferencia", comprobanteImagen: "/comprobantes/comprobante-1.png", comprobanteSubidoEl: "2026-06-15T10:00:00", resueltoEl: "2026-06-15T18:30:00" },
  { id: "d3", equipoId: "e1", concepto: "Fecha 2 — Cuota de partido", monto: 9000, creadoEl: "2026-06-28T00:00:00", estado: "aprobado", medio: "transferencia", comprobanteImagen: "/comprobantes/comprobante-3.png", comprobanteSubidoEl: "2026-06-28T21:00:00", resueltoEl: "2026-06-29T09:10:00" },
  { id: "d4", equipoId: "e1", concepto: "Fecha 3 — Cuota de partido", monto: 9000, creadoEl: "2026-07-12T00:00:00", estado: "pendiente" },
  { id: "d5", equipoId: "e1", concepto: "Multa por entrega tardía de resultado", monto: 3000, creadoEl: "2026-07-15T00:00:00", estado: "rechazado", comprobanteImagen: "/comprobantes/comprobante-2.png", comprobanteSubidoEl: "2026-07-16T09:00:00", medio: "transferencia", resueltoEl: "2026-07-16T20:00:00" },
  { id: "d6", equipoId: "e1", concepto: "Fecha 4 — Cuota de partido", monto: 9000, creadoEl: "2026-07-26T00:00:00", estado: "en_revision", comprobanteImagen: "/comprobantes/comprobante-2.png", comprobanteSubidoEl: "2026-08-05T10:47:00" },

  // Otros equipos — en revisión, esperando aprobación en el Buzón
  { id: "d7", equipoId: "e3", concepto: "Inscripción — Apertura 2026", monto: 36000, creadoEl: "2026-07-20T00:00:00", estado: "en_revision", comprobanteImagen: "/comprobantes/comprobante-1.png", comprobanteSubidoEl: "2026-08-05T09:12:00" },
  { id: "d8", equipoId: "e6", concepto: "Fecha 4 — Cuota de partido", monto: 9000, creadoEl: "2026-07-26T00:00:00", estado: "en_revision", comprobanteImagen: "/comprobantes/comprobante-3.png", comprobanteSubidoEl: "2026-08-05T11:20:00" },
  { id: "d9", equipoId: "e7", concepto: "Inscripción — Apertura 2026 (parcial)", monto: 18000, creadoEl: "2026-07-20T00:00:00", estado: "en_revision", comprobanteImagen: "/comprobantes/comprobante-1.png", comprobanteSubidoEl: "2026-08-05T12:05:00" },
  { id: "d10", equipoId: "e9", concepto: "Fecha 3 — Cuota adeudada", monto: 12000, creadoEl: "2026-07-12T00:00:00", estado: "en_revision", comprobanteImagen: "/comprobantes/comprobante-2.png", comprobanteSubidoEl: "2026-08-05T13:33:00" },
  { id: "d11", equipoId: "e13", concepto: "Fecha 4 — Cuota de partido", monto: 9000, creadoEl: "2026-07-26T00:00:00", estado: "en_revision", comprobanteImagen: "/comprobantes/comprobante-3.png", comprobanteSubidoEl: "2026-08-06T08:15:00" },
  { id: "d12", equipoId: "e11", concepto: "Multa por reprogramación", monto: 6000, creadoEl: "2026-08-01T00:00:00", estado: "en_revision", comprobanteImagen: "/comprobantes/comprobante-1.png", comprobanteSubidoEl: "2026-08-06T09:40:00" },
  { id: "d13", equipoId: "e14", concepto: "Inscripción — Apertura 2026 (parcial)", monto: 18000, creadoEl: "2026-07-20T00:00:00", estado: "en_revision", comprobanteImagen: "/comprobantes/comprobante-2.png", comprobanteSubidoEl: "2026-08-06T10:22:00" },
]

export const CONCEPTOS_DEUDA = ["Inscripción", "Cuota de partido", "Alquiler de cancha", "Multa", "Otro"] as const

export interface Partido {
  id: string
  jornada: number
  fecha: string
  equipoA: string
  equipoB: string
  cancha: string
  hora: string
  setsA: number | null
  setsB: number | null
}

export const canchas = ["Cancha 1 — Club Ferro", "Cancha 2 — Club Ferro", "Cancha 3 — Polideportivo Municipal", "Cancha 4 — Polideportivo Municipal"]

export const partidos: Partido[] = [
  { id: "p1", jornada: 4, fecha: "2026-08-09", equipoA: "Los Topadores", equipoB: "Águilas del Sur", cancha: "Cancha 1 — Club Ferro", hora: "10:00", setsA: null, setsB: null },
  { id: "p2", jornada: 4, fecha: "2026-08-09", equipoA: "Halcones de Núñez", equipoB: "Cóndores VC", cancha: "Cancha 2 — Club Ferro", hora: "10:00", setsA: null, setsB: null },
  { id: "p3", jornada: 4, fecha: "2026-08-09", equipoA: "Los Andes VC", equipoB: "San Lorenzo Vóley", cancha: "Cancha 3 — Polideportivo Municipal", hora: "11:30", setsA: null, setsB: null },
  { id: "p4", jornada: 4, fecha: "2026-08-09", equipoA: "Villa Crespo VC", equipoB: "Estudiantes Vóley", cancha: "Cancha 4 — Polideportivo Municipal", hora: "11:30", setsA: null, setsB: null },
  { id: "p5", jornada: 3, fecha: "2026-08-02", equipoA: "Los Topadores", equipoB: "Halcones de Núñez", cancha: "Cancha 1 — Club Ferro", hora: "10:00", setsA: 3, setsB: 1 },
  { id: "p6", jornada: 3, fecha: "2026-08-02", equipoA: "Cóndores VC", equipoB: "Los Andes VC", cancha: "Cancha 2 — Club Ferro", hora: "10:00", setsA: 2, setsB: 3 },
  { id: "p7", jornada: 3, fecha: "2026-08-02", equipoA: "San Lorenzo Vóley", equipoB: "Villa Crespo VC", cancha: "Cancha 3 — Polideportivo Municipal", hora: "11:30", setsA: 3, setsB: 0 },
  { id: "p8", jornada: 1, fecha: "2026-07-19", equipoA: "Los Topadores", equipoB: "Cóndores VC", cancha: "Cancha 1 — Club Ferro", hora: "10:00", setsA: 3, setsB: 2 },
  { id: "p9", jornada: 2, fecha: "2026-07-26", equipoA: "Los Topadores", equipoB: "Los Andes VC", cancha: "Cancha 2 — Club Ferro", hora: "10:00", setsA: 1, setsB: 3 },
]

export interface Jugador {
  id: string
  nombre: string
  numero: number
  dni: string
  equipoId: string
}

export const rostersEjemplo: Record<string, Jugador[]> = {
  e3: [
    { id: "j1", nombre: "Diego Suárez", numero: 4, dni: "38.221.443", equipoId: "e3" },
    { id: "j2", nombre: "Franco Medina", numero: 7, dni: "39.108.772", equipoId: "e3" },
    { id: "j3", nombre: "Ezequiel Paz", numero: 9, dni: "37.556.019", equipoId: "e3" },
    { id: "j4", nombre: "Bruno Cabrera", numero: 10, dni: "40.223.118", equipoId: "e3" },
    { id: "j5", nombre: "Iván Rodríguez", numero: 12, dni: "38.990.421", equipoId: "e3" },
    { id: "j6", nombre: "Lautaro Vega", numero: 14, dni: "41.087.336", equipoId: "e3" },
  ],
  e6: [
    { id: "j7", nombre: "Camila Torres", numero: 3, dni: "39.771.220", equipoId: "e6" },
    { id: "j8", nombre: "Ana Belén Ríos", numero: 5, dni: "40.556.891", equipoId: "e6" },
    { id: "j9", nombre: "Micaela Luna", numero: 8, dni: "38.334.107", equipoId: "e6" },
    { id: "j10", nombre: "Rocío Ferreyra", numero: 11, dni: "41.229.554", equipoId: "e6" },
    { id: "j11", nombre: "Paula Giménez", numero: 13, dni: "39.887.663", equipoId: "e6" },
  ],
  e9: [
    { id: "j12", nombre: "Joaquín Morales", numero: 6, dni: "37.998.201", equipoId: "e9" },
    { id: "j13", nombre: "Santiago Ledesma", numero: 8, dni: "40.117.845", equipoId: "e9" },
    { id: "j14", nombre: "Gonzalo Ibáñez", numero: 15, dni: "38.665.032", equipoId: "e9" },
  ],
  e13: [
    { id: "j15", nombre: "Tomás Aguirre", numero: 2, dni: "39.443.910", equipoId: "e13" },
    { id: "j16", nombre: "Emiliano Ponce", numero: 9, dni: "40.882.177", equipoId: "e13" },
    { id: "j17", nombre: "Ramiro Castro", numero: 11, dni: "38.221.556", equipoId: "e13" },
    { id: "j18", nombre: "Nahuel Ojeda", numero: 12, dni: "41.556.204", equipoId: "e13" },
  ],
}

// ---- Reglamento: mínimo de partidos jugados para habilitar playoff ----
// Pendiente de confirmar el número exacto con los organizadores del Torneo Santana.
export const PARTIDOS_MINIMOS_PLAYOFF = 6

// Convocatoria: qué jugadores (por id) fueron citados/jugaron en cada partido ya disputado.
export const convocatorias: Record<string, string[]> = {
  p8: ["jc1", "jc2"],
  p9: ["jc1", "jc3"],
  p5: ["jc1", "jc2", "jc3"],
}

export function partidosJugadosPorJugador(jugadorId: string): number {
  return partidos.filter((p) => p.setsA !== null && convocatorias[p.id]?.includes(jugadorId)).length
}

// ---- Vista del capitán (equipo demo: Los Topadores) ----
export const equipoCapitan = {
  id: "e1",
  nombre: "Los Topadores",
  capitan: "Martín Gómez",
}

export const jugadoresCapitan: Jugador[] = [
  { id: "jc1", nombre: "Martín Gómez", numero: 5, dni: "37.112.884", equipoId: "e1" },
  { id: "jc2", nombre: "Pablo Núñez", numero: 8, dni: "38.665.201", equipoId: "e1" },
  { id: "jc3", nombre: "Lucas Ferrari", numero: 10, dni: "39.220.117", equipoId: "e1" },
]

// ---- Listado plano de jugadores (todos los planteles cargados), para el panel admin ----
export const jugadores: Jugador[] = [...jugadoresCapitan, ...Object.values(rostersEjemplo).flat()]

// ---- Configuración del torneo (1.4.2.1) ----
export type FormatoTorneo = "liga" | "liga-playoff" | "grupos-playoff"

export interface ConfigTorneo {
  nombre: string
  temporada: string
  organizador: string
  fechaInicio: string
  cantidadJornadas: number
  formato: FormatoTorneo
  setsParaGanar: number
  puntosVictoria: number // 3-0 / 3-1
  puntosVictoriaAjustada: number // 3-2
  puntosDerrotaAjustada: number // 2-3
  minimoPartidosPlayoff: number
  inscripcionAbierta: boolean
}

export const FORMATOS: Record<FormatoTorneo, string> = {
  liga: "Liga (todos contra todos)",
  "liga-playoff": "Liga + playoff",
  "grupos-playoff": "Fase de grupos + playoff",
}

export const configTorneoInicial: ConfigTorneo = {
  nombre: TORNEO.nombre,
  temporada: TORNEO.temporada,
  organizador: "Asociación Vóley Amateur Metropolitana",
  fechaInicio: "2026-07-19",
  cantidadJornadas: 13,
  formato: "liga-playoff",
  setsParaGanar: 3,
  puntosVictoria: 3,
  puntosVictoriaAjustada: 2,
  puntosDerrotaAjustada: 1,
  minimoPartidosPlayoff: PARTIDOS_MINIMOS_PLAYOFF,
  inscripcionAbierta: false,
}

// ---- Fee por fecha (1.4.4.1) ----
export interface ConfigFees {
  inscripcion: number
  cuotaPorFecha: number
  vencimientoDias: number // días después de la fecha para pagar antes de quedar moroso
  bloqueoAutomatico: boolean // bloquear al equipo si supera el tope de deuda
  topeDeuda: number
}

export const configFeesInicial: ConfigFees = {
  inscripcion: 36000,
  cuotaPorFecha: 9000,
  vencimientoDias: 7,
  bloqueoAutomatico: true,
  topeDeuda: 30000,
}

// ---- Jornadas / fechas (1.4.2.4) ----
export type EstadoJornada = "jugada" | "en-curso" | "programada" | "reprogramada"

export interface Jornada {
  numero: number
  fecha: string
  estado: EstadoJornada
  fee: number
}

export const jornadasIniciales: Jornada[] = [
  { numero: 1, fecha: "2026-07-19", estado: "jugada", fee: 9000 },
  { numero: 2, fecha: "2026-07-26", estado: "jugada", fee: 9000 },
  { numero: 3, fecha: "2026-08-02", estado: "jugada", fee: 9000 },
  { numero: 4, fecha: "2026-08-09", estado: "en-curso", fee: 9000 },
  { numero: 5, fecha: "2026-08-16", estado: "programada", fee: 9000 },
  { numero: 6, fecha: "2026-08-23", estado: "programada", fee: 9000 },
]

// ---- Sanciones (1.4.3) ----
export type TipoSancion = "amonestacion" | "suspension" | "multa"

export const TIPOS_SANCION: Record<TipoSancion, string> = {
  amonestacion: "Amonestación",
  suspension: "Suspensión por fechas",
  multa: "Multa económica",
}

export interface Sancion {
  id: string
  equipoId: string
  jugadorId?: string // vacío = sanción al equipo
  tipo: TipoSancion
  motivo: string
  jornadaInicio: number
  fechas: number // fechas de suspensión (0 si no aplica)
  monto?: number
  creadaEl: string
  anulada?: boolean
}

export const sancionesIniciales: Sancion[] = [
  { id: "s1", equipoId: "e3", jugadorId: "j2", tipo: "suspension", motivo: "Agresión verbal al árbitro", jornadaInicio: 3, fechas: 2, creadaEl: "2026-08-03T10:00:00" },
  { id: "s2", equipoId: "e1", jugadorId: "jc2", tipo: "suspension", motivo: "Doble tarjeta roja (expulsión)", jornadaInicio: 4, fechas: 1, creadaEl: "2026-08-03T11:00:00" },
  { id: "s3", equipoId: "e1", tipo: "multa", motivo: "Entrega tardía de resultado", jornadaInicio: 2, fechas: 0, monto: 3000, creadaEl: "2026-07-15T00:00:00" },
  { id: "s4", equipoId: "e9", jugadorId: "j13", tipo: "amonestacion", motivo: "Conducta antideportiva", jornadaInicio: 3, fechas: 0, creadaEl: "2026-08-02T13:00:00" },
  { id: "s5", equipoId: "e13", jugadorId: "j16", tipo: "suspension", motivo: "Jugó sin estar habilitado", jornadaInicio: 1, fechas: 2, creadaEl: "2026-07-20T09:00:00" },
  { id: "s6", equipoId: "e11", tipo: "multa", motivo: "Reprogramación fuera de término", jornadaInicio: 4, fechas: 0, monto: 6000, creadaEl: "2026-08-01T00:00:00" },
]

// ---- Usuarios y permisos (1.4.1) ----
export type Rol = "admin" | "tesorero" | "delegado"

export const ROLES: Record<Rol, string> = {
  admin: "Administrador",
  tesorero: "Tesorero",
  delegado: "Delegado de equipo",
}

export type Permiso =
  | "torneo.configurar"
  | "equipos.gestionar"
  | "fixture.gestionar"
  | "resultados.cargar"
  | "pagos.validar"
  | "pagos.configurar"
  | "sanciones.gestionar"
  | "usuarios.gestionar"
  | "plantel.propio"
  | "pagos.propios"

export const PERMISOS: { id: Permiso; label: string; grupo: string }[] = [
  { id: "torneo.configurar", label: "Crear y configurar el torneo", grupo: "Torneo" },
  { id: "equipos.gestionar", label: "Gestionar equipos y jugadores", grupo: "Torneo" },
  { id: "fixture.gestionar", label: "Armar fixture y jornadas", grupo: "Torneo" },
  { id: "resultados.cargar", label: "Cargar resultados", grupo: "Torneo" },
  { id: "pagos.validar", label: "Validar comprobantes y registrar pagos", grupo: "Pagos" },
  { id: "pagos.configurar", label: "Configurar fees", grupo: "Pagos" },
  { id: "sanciones.gestionar", label: "Registrar y anular sanciones", grupo: "Disciplina" },
  { id: "usuarios.gestionar", label: "Gestionar usuarios y permisos", grupo: "Usuarios" },
  { id: "plantel.propio", label: "Cargar plantel de su equipo", grupo: "Delegado" },
  { id: "pagos.propios", label: "Subir comprobantes de su equipo", grupo: "Delegado" },
]

export const permisosIniciales: Record<Rol, Permiso[]> = {
  admin: PERMISOS.map((p) => p.id).filter((p) => p !== "plantel.propio" && p !== "pagos.propios"),
  tesorero: ["pagos.validar", "pagos.configurar"],
  delegado: ["plantel.propio", "pagos.propios"],
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  equipoId?: string
  activo: boolean
  invitacionPendiente?: boolean
}

export const usuariosIniciales: Usuario[] = [
  { id: "u1", nombre: "Carla Benítez", email: "carla@torneosantana.com", rol: "admin", activo: true },
  { id: "u2", nombre: "Hernán Quiroga", email: "hernan@torneosantana.com", rol: "admin", activo: true },
  { id: "u3", nombre: "Mariela Ortiz", email: "tesoreria@torneosantana.com", rol: "tesorero", activo: true },
  ...equipos.map<Usuario>((e, i) => ({
    id: `ud${i + 1}`,
    nombre: e.capitan,
    email: `${e.capitan.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}@mail.com`,
    rol: "delegado",
    equipoId: e.id,
    activo: e.roster !== "sin-enviar",
    invitacionPendiente: e.roster === "sin-enviar",
  })),
]
