import { useState } from "react";

const games = [
  { id: 1, name: "VALORANT", icon: "🎯", rank: "Platino I", level: 38 },
  { id: 2, name: "League of Legends", icon: "⚔️", rank: "Oro II", level: 42 },
  { id: 3, name: "Counter-Strike 2", icon: "🔫", rank: "MG2", level: 27 },
  { id: 4, name: "Fortnite", icon: "🏝️", rank: "Diamante", level: 51 },
];

const friends = [
  { name: "NicoGG", game: "VALORANT", status: "Jugando", color: "🟢" },
  { name: "MatiPro", game: "League of Legends", status: "En partida", color: "🟢" },
  { name: "LuchoFPS", game: "Counter-Strike 2", status: "Jugando", color: "🟢" },
  { name: "AgusPlay", game: "Fortnite", status: "Online", color: "🟢" },
];

const tournaments = [
  {
    name: "GG-Hub Summer Cup",
    game: "VALORANT",
    prize: "$150.000",
    players: "32 / 64",
    date: "12 SEP",
  },
  {
    name: "Weekend Battle",
    game: "Counter-Strike 2",
    prize: "$100.000",
    players: "18 / 32",
    date: "14 SEP",
  },
  {
    name: "GG Ranked Night",
    game: "League of Legends",
    prize: "$75.000",
    players: "41 / 64",
    date: "18 SEP",
  },
];

function App() {
  const [logged, setLogged] = useState(true);
  const [page, setPage] = useState("inicio");
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState("");

  const [user, setUser] = useState({
    name: "Juan",
    username: "@juanGG",
    bio: "Gamer · Competitivo · GG-Hub",
  });

  const [myGames, setMyGames] = useState(games);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const navigate = (target) => {
    setPage(target);
    setMobileMenu(false);
  };

  const addGame = () => {
    const name = prompt("¿Qué juego querés agregar?");
    if (!name) return;

    const newGame = {
      id: Date.now(),
      name,
      icon: "🎮",
      rank: "Sin rango",
      level: 1,
    };

    setMyGames([...myGames, newGame]);
    showToast("Juego agregado a tu perfil");
  };

  const removeGame = (id) => {
    setMyGames(myGames.filter((game) => game.id !== id));
    showToast("Juego eliminado");
  };

  const joinTournament = (name) => {
    showToast(`Te inscribiste en ${name}`);
  };

  const sendFriend = (name) => {
    showToast(`Solicitud enviada a ${name}`);
  };

  const filteredGames = myGames.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!logged) {
    return (
      <div className="auth-screen">
        <div className="auth-glow"></div>

        <div className="auth-container">
          <div className="auth-brand">
            <div className="brand-mark">GG</div>
            <span>GG-HUB</span>
          </div>

          <div className="auth-card">
            <div className="auth-icon">🎮</div>

            <h1>Bienvenido a GG-Hub</h1>

            <p>
              Tu lugar para jugar, encontrar tu squad y competir.
            </p>

            <input
              type="text"
              placeholder="Usuario"
              defaultValue="Juan"
            />

            <input
              type="password"
              placeholder="Contraseña"
              defaultValue="123456"
            />

            <button
              className="primary-btn full"
              onClick={() => setLogged(true)}
            >
              Entrar a GG-Hub
            </button>

            <div className="auth-divider">
              <span>o</span>
            </div>

            <button
              className="secondary-btn full"
              onClick={() => {
                setLogged(true);
                showToast("Cuenta creada correctamente");
              }}
            >
              Crear una cuenta
            </button>
          </div>

          <p className="auth-footer">
            GG-Hub · La nueva comunidad gamer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "app dark-mode" : "app light-mode"}>
      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        ></div>
      )}

      <aside className={mobileMenu ? "sidebar mobile-open" : "sidebar"}>
        <div className="sidebar-logo">
          <div className="brand-mark">GG</div>
          <div>
            <strong>GG-HUB</strong>
            <small>GAMER NETWORK</small>
          </div>
        </div>

        <div className="sidebar-section">
          <span>MENÚ</span>

          <button
            className={page === "inicio" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("inicio")}
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className={page === "juegos" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("juegos")}
          >
            <span>🎮</span>
            Mis juegos
          </button>

          <button
            className={page === "torneos" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("torneos")}
          >
            <span>🏆</span>
            Torneos
          </button>

          <button
            className={page === "amigos" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("amigos")}
          >
            <span>👥</span>
            Amigos
          </button>

          <button
            className={page === "mensajes" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("mensajes")}
          >
            <span>💬</span>
            Mensajes
            <b className="nav-badge">3</b>
          </button>
        </div>

        <div className="sidebar-section">
          <span>CUENTA</span>

          <button
            className={page === "perfil" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("perfil")}
          >
            <span>👤</span>
            Mi perfil
          </button>

          <button
            className={page === "estadisticas" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("estadisticas")}
          >
            <span>📊</span>
            Estadísticas
          </button>

          <button
            className={page === "configuracion" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("configuracion")}
          >
            <span>⚙️</span>
            Configuración
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">⚡</div>
            <strong>GG-Hub PRO</strong>
            <p>Próximamente nuevas funciones.</p>
            <button onClick={() => showToast("GG-Hub PRO llegará próximamente")}>
              Saber más
            </button>
          </div>

          <button
            className="logout-btn"
            onClick={() => setLogged(false)}
          >
            ↪ Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            ☰
          </button>

          <div className="breadcrumb">
            <span>GG-HUB</span>
            <b>/</b>
            <strong>
              {page === "inicio"
                ? "Inicio"
                : page === "juegos"
                ? "Mis juegos"
                : page === "torneos"
                ? "Torneos"
                : page === "amigos"
                ? "Amigos"
                : page === "mensajes"
                ? "Mensajes"
                : page === "perfil"
                ? "Mi perfil"
                : page === "estadisticas"
                ? "Estadísticas"
                : "Configuración"}
            </strong>
          </div>

          <div className="topbar-actions">
            <div className="search-wrapper">
              <span>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar juegos..."
              />
            </div>

            <div className="notification-wrapper">
              <button
                className="icon-btn"
                onClick={() => setNotifications(!notifications)}
              >
                🔔
                <i></i>
              </button>

              {notifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <strong>Notificaciones</strong>
                    <span>3 nuevas</span>
                  </div>

                  <div className="notification-item">
                    <div>🏆</div>
                    <p>
                      <strong>GG-Hub Summer Cup</strong>
                      <br />
                      Las inscripciones están abiertas.
                    </p>
                  </div>

                  <div className="notification-item">
                    <div>👥</div>
                    <p>
                      <strong>NicoGG</strong>
                      <br />
                      Está jugando VALORANT.
                    </p>
                  </div>

                  <div className="notification-item">
                    <div>⚡</div>
                    <p>
                      <strong>Nuevo logro</strong>
                      <br />
                      Subiste de nivel.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              className="top-profile"
              onClick={() => navigate("perfil")}
            >
              <div className="avatar">J</div>
              <div>
                <strong>Juan</strong>
                <small>Online</small>
              </div>
              <span>⌄</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          {page === "inicio" && (
            <>
              <section className="hero">
                <div className="hero-content">
                  <div className="hero-tag">
                    <span></span>
                    GG-HUB ESTÁ ONLINE
                  </div>

                  <h1>
                    Donde los gamers
                    <br />
                    <em>encuentran su squad.</em>
                  </h1>

                  <p>
                    Organizá tus juegos, encontrá jugadores,
                    competí en torneos y construí tu perfil gamer.
                  </p>

                  <div className="hero-buttons">
                    <button
                      className="primary-btn"
                      onClick={() => navigate("amigos")}
                    >
                      Encontrar jugadores →
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() => navigate("torneos")}
                    >
                      Ver torneos
                    </button>
                  </div>
                </div>

                <div className="hero-visual">
                  <div className="hero-orbit"></div>
                  <div className="hero-controller">🎮</div>
                  <div className="floating-card card-one">
                    <span>🏆</span>
                    <div>
                      <strong>Nuevo torneo</strong>
                      <small>Summer Cup</small>
                    </div>
                  </div>

                  <div className="floating-card card-two">
                    <span>🟢</span>
                    <div>
                      <strong>128 jugadores</strong>
                      <small>online ahora</small>
                    </div>
                  </div>
                </div>
              </section>

              <section className="welcome-row">
                <div>
                  <span className="eyebrow">TU ACTIVIDAD</span>
                  <h2>Todo tu mundo gamer, en un solo lugar.</h2>
                </div>

                <button
                  className="text-btn"
                  onClick={() => navigate("estadisticas")}
                >
                  Ver estadísticas →
                </button>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎮</div>
                  <div>
                    <small>Juegos</small>
                    <strong>{myGames.length}</strong>
                    <span>en tu perfil</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div>
                    <small>Torneos</small>
                    <strong>8</strong>
                    <span>disponibles</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div>
                    <small>Amigos</small>
                    <strong>24</strong>
                    <span>en tu red</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div>
                    <small>GG XP</small>
                    <strong>2.840</strong>
                    <span>nivel 18</span>
                  </div>
                </div>
              </section>

              <section className="dashboard-grid">
                <div className="panel large-panel">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">COMPETICIÓN</span>
                      <h3>Próximos torneos</h3>
                    </div>

                    <button
                      className="text-btn"
                      onClick={() => navigate("torneos")}
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="tournament-list">
                    {tournaments.map((tournament) => (
                      <div className="tournament-row" key={tournament.name}>
                        <div className="tournament-game">
                          <div className="game-icon">
                            {tournament.game === "VALORANT"
                              ? "🎯"
                              : tournament.game === "Counter-Strike 2"
                              ? "🔫"
                              : "⚔️"}
                          </div>

                          <div>
                            <strong>{tournament.name}</strong>
                            <span>{tournament.game}</span>
                          </div>
                        </div>

                        <div className="tournament-info">
                          <span>Premio</span>
                          <strong>{tournament.prize}</strong>
                        </div>

                        <div className="tournament-info">
                          <span>Jugadores</span>
                          <strong>{tournament.players}</strong>
                        </div>

                        <div className="tournament-date">
                          <small>{tournament.date}</small>
                        </div>

                        <button
                          className="small-btn"
                          onClick={() => joinTournament(tournament.name)}
                        >
                          Unirse
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">TU SQUAD</span>
                      <h3>Amigos online</h3>
                    </div>

                    <span className="online-count">4 online</span>
                  </div>

                  <div className="friends-list">
                    {friends.map((friend) => (
                      <div className="friend-row" key={friend.name}>
                        <div className="friend-avatar">
                          {friend.name.charAt(0)}
                        </div>

                        <div className="friend-info">
                          <strong>{friend.name}</strong>
                          <span>
                            {friend.color} {friend.status}
                          </span>
                        </div>

                        <button
                          className="friend-chat"
                          onClick={() => {
                            navigate("mensajes");
                            showToast(`Abriste el chat con ${friend.name}`);
                          }}
                        >
                          💬
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="secondary-btn full"
                    onClick={() => navigate("amigos")}
                  >
                    Ver todos mis amigos
                  </button>
                </div>
              </section>

              <section className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <span className="eyebrow">RECIENTE</span>
                    <h3>Actividad de tu red</h3>
                  </div>
                </div>

                <div className="activity-grid">
                  <div className="activity-item">
                    <div className="activity-avatar">N</div>
                    <div>
                      <p>
                        <strong>NicoGG</strong> empezó una partida de
                        VALORANT.
                      </p>
                      <span>Hace 5 minutos</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-avatar">M</div>
                    <div>
                      <p>
                        <strong>MatiPro</strong> subió a Platino III.
                      </p>
                      <span>Hace 21 minutos</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-avatar">🏆</div>
                    <div>
                      <p>
                        Hay <strong>3 nuevos torneos</strong> disponibles.
                      </p>
                      <span>Hace 1 hora</span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {page === "juegos" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">TU PERFIL GAMER</span>
                  <h1>Mis juegos</h1>
                  <p>Mostrá qué jugás y qué rango tenés.</p>
                </div>

                <button className="primary-btn" onClick={addGame}>
                  + Agregar juego
                </button>
              </div>

              <div className="games-grid">
                {filteredGames.map((game) => (
                  <div className="game-card" key={game.id}>
                    <div className="game-card-top">
                      <div className="game-large-icon">{game.icon}</div>
                      <button
                        className="delete-btn"
                        onClick={() => removeGame(game.id)}
                      >
                        ×
                      </button>
                    </div>

                    <h3>{game.name}</h3>
                    <span className="game-rank">{game.rank}</span>

                    <div className="game-card-footer">
                      <span>Nivel {game.level}</span>
                      <div className="progress">
                        <i style={{ width: `${Math.min(game.level * 1.5, 100)}%` }}></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {page === "torneos" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">COMPETÍ</span>
                  <h1>Torneos</h1>
                  <p>Encontrá una competencia y demostrale a todos quién manda.</p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => showToast("Creación de torneos próximamente")}
                >
                  + Crear torneo
                </button>
              </div>

              <div className="tournaments-grid">
                {tournaments.map((tournament) => (
                  <div className="tournament-card" key={tournament.name}>
                    <div className="tournament-cover">
                      <span>
                        {tournament.game === "VALORANT"
                          ? "🎯"
                          : tournament.game === "Counter-Strike 2"
                          ? "🔫"
                          : "⚔️"}
                      </span>

                      <small>{tournament.game}</small>
                    </div>

                    <div className="tournament-card-body">
                      <span className="status-pill">INSCRIPCIONES ABIERTAS</span>
                      <h3>{tournament.name}</h3>

                      <div className="tournament-meta">
                        <div>
                          <small>Premio</small>
                          <strong>{tournament.prize}</strong>
                        </div>

                        <div>
                          <small>Jugadores</small>
                          <strong>{tournament.players}</strong>
                        </div>

                        <div>
                          <small>Fecha</small>
                          <strong>{tournament.date}</strong>
                        </div>
                      </div>

                      <button
                        className="primary-btn full"
                        onClick={() => joinTournament(tournament.name)}
                      >
                        Unirme al torneo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {page === "amigos" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">TU COMUNIDAD</span>
                  <h1>Amigos</h1>
                  <p>Encontrá jugadores para armar tu próximo squad.</p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => showToast("Buscador de jugadores próximamente")}
                >
                  Buscar jugadores
                </button>
              </div>

              <div className="friends-grid">
                {friends.map((friend) => (
                  <div className="friend-card" key={friend.name}>
                    <div className="friend-card-avatar">
                      {friend.name.charAt(0)}
                      <i></i>
                    </div>

                    <h3>{friend.name}</h3>
                    <span>{friend.game}</span>

                    <div className="friend-card-actions">
                      <button
                        className="primary-btn"
                        onClick={() => sendFriend(friend.name)}
                      >
                        Agregar
                      </button>

                      <button
                        className="secondary-btn"
                        onClick={() => {
                          navigate("mensajes");
                          showToast(`Chat con ${friend.name}`);
                        }}
                      >
                        Mensaje
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {page === "mensajes" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">COMUNIDAD</span>
                  <h1>Mensajes</h1>
                  <p>Hablá con tu squad.</p>
                </div>
              </div>

              <div className="messages-layout">
                <div className="conversation-list">
                  {friends.map((friend, index) => (
                    <button
                      className={index === 0 ? "conversation active" : "conversation"}
                      key={friend.name}
                    >
                      <div className="friend-avatar">
                        {friend.name.charAt(0)}
                      </div>

                      <div>
                        <strong>{friend.name}</strong>
                        <span>
                          {index === 0
                            ? "¿Entramos a ranked?"
                            : "Nos vemos en partida"}
                        </span>
                      </div>

                      {index < 3 && <b>{index + 1}</b>}
                    </button>
                  ))}
                </div>

                <div className="chat-panel">
                  <div className="chat-header">
                    <div className="friend-avatar">N</div>
                    <div>
                      <strong>NicoGG</strong>
                      <span>🟢 Jugando VALORANT</span>
                    </div>
                  </div>

                  <div className="chat-messages">
                    <div className="message received">
                      <span>¿Entramos a ranked?</span>
                      <small>14:18</small>
                    </div>

                    <div className="message sent">
                      <span>Dale, termino esto y entro.</span>
                      <small>14:19</small>
                    </div>

                    <div className="message received">
                      <span>Perfecto 🔥</span>
                      <small>14:20</small>
                    </div>
                  </div>

                  <div className="chat-input">
                    <input
                      placeholder="Escribí un mensaje..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          showToast("Mensaje enviado");
                          e.target.value = "";
                        }
                      }}
                    />

                    <button
                      onClick={() => showToast("Mensaje enviado")}
                    >
                      ➤
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {page === "estadisticas" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">TU RENDIMIENTO</span>
                  <h1>Estadísticas</h1>
                  <p>Tu actividad gamer resumida.</p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">⚔️</div>
                  <div>
                    <small>Partidas</small>
                    <strong>286</strong>
                    <span>este mes</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div>
                    <small>Victorias</small>
                    <strong>164</strong>
                    <span>57,3% winrate</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div>
                    <small>GG XP</small>
                    <strong>2.840</strong>
                    <span>+420 esta semana</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <div>
                    <small>Racha</small>
                    <strong>7</strong>
                    <span>victorias seguidas</span>
                  </div>
                </div>
              </div>

              <div className="statistics-layout">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">ACTIVIDAD</span>
                      <h3>Rendimiento semanal</h3>
                    </div>
                  </div>

                  <div className="fake-chart">
                    <div className="chart-bars">
                      <i style={{ height: "38%" }}></i>
                      <i style={{ height: "58%" }}></i>
                      <i style={{ height: "45%" }}></i>
                      <i style={{ height: "75%" }}></i>
                      <i style={{ height: "62%" }}></i>
                      <i style={{ height: "88%" }}></i>
                      <i style={{ height: "96%" }}></i>
                    </div>

                    <div className="chart-labels">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mié</span>
                      <span>Jue</span>
                      <span>Vie</span>
                      <span>Sáb</span>
                      <span>Dom</span>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">RANKING</span>
                      <h3>Tu posición</h3>
                    </div>
                  </div>

                  <div className="ranking-position">
                    <strong>#128</strong>
                    <span>entre todos los jugadores</span>
                  </div>

                  <div className="ranking-progress">
                    <div>
                      <span>GG XP</span>
                      <strong>2.840 / 4.000</strong>
                    </div>

                    <div className="progress">
                      <i style={{ width: "71%" }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {page === "perfil" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">IDENTIDAD GAMER</span>
                  <h1>Mi perfil</h1>
                  <p>Así te ven los demás jugadores.</p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => showToast("Perfil actualizado")}
                >
                  Guardar cambios
                </button>
              </div>

              <div className="profile-layout">
                <div className="profile-card">
                  <div className="profile-cover"></div>

                  <div className="profile-main">
                    <div className="profile-big-avatar">J</div>

                    <div className="profile-name">
                      <h2>{user.name}</h2>
                      <span>{user.username}</span>
                    </div>

                    <div className="profile-status">
                      <i></i>
                      Online
                    </div>

                    <p>{user.bio}</p>

                    <div className="profile-tags">
                      <span>🎯 Competitivo</span>
                      <span>🎮 PC Gamer</span>
                      <span>🏆 Torneos</span>
                    </div>
                  </div>
                </div>

                <div className="panel profile-edit">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">DATOS</span>
                      <h3>Editar perfil</h3>
                    </div>
                  </div>

                  <label>
                    Nombre
                    <input
                      value={user.name}
                      onChange={(e) =>
                        setUser({ ...user, name: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Usuario
                    <input
                      value={user.username}
                      onChange={(e) =>
                        setUser({ ...user, username: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Biografía
                    <textarea
                      value={user.bio}
                      onChange={(e) =>
                        setUser({ ...user, bio: e.target.value })
                      }
                    ></textarea>
                  </label>
                </div>
              </div>
            </section>
          )}

          {page === "configuracion" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">PERSONALIZACIÓN</span>
                  <h1>Configuración</h1>
                  <p>Configurá tu experiencia en GG-Hub.</p>
                </div>
              </div>

              <div className="settings-list">
                <div className="setting-row">
                  <div>
                    <strong>Apariencia</strong>
                    <span>Cambiar el aspecto de GG-Hub.</span>
                  </div>

                  <button
                    className="toggle-setting"
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    {darkMode ? "🌙 Oscuro" : "☀️ Claro"}
                  </button>
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Notificaciones</strong>
                    <span>Recibir avisos de amigos y torneos.</span>
                  </div>

                  <button
                    className="switch active"
                    onClick={() => showToast("Notificaciones activadas")}
                  >
                    <i></i>
                  </button>
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Sonidos</strong>
                    <span>Sonidos de la plataforma.</span>
                  </div>

                  <button
                    className="switch active"
                    onClick={() => showToast("Configuración de sonido actualizada")}
                  >
                    <i></i>
                  </button>
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Perfil público</strong>
                    <span>Permití que otros jugadores encuentren tu perfil.</span>
                  </div>

                  <button
                    className="switch active"
                    onClick={() => showToast("Privacidad actualizada")}
                  >
                    <i></i>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

export default App;