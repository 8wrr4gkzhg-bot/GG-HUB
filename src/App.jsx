import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const gameIcons = {
  VALORANT: "🎯",
  "League of Legends": "⚔️",
  "Counter-Strike 2": "🔫",
  Fortnite: "🏝️",
  "Rocket League": "🚗",
  Minecraft: "⛏️",
  "Overwatch 2": "🦾",
  "Apex Legends": "🔺",
  "Rainbow Six Siege": "🛡️",
  "Call of Duty": "💥",
};

const getGameIcon = (name) => gameIcons[name] || "🎮";

function App() {
  const [logged, setLogged] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [authMode, setAuthMode] = useState("login");
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [page, setPage] = useState("inicio");
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState("");

  const [games, setGames] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [friends, setFriends] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);

  const [loadingData, setLoadingData] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [players, setPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");

  const [profileForm, setProfileForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      const sessionUser = data.session?.user || null;

      if (sessionUser) {
        setCurrentUser(sessionUser);
        setLogged(true);
        await loadUserData(sessionUser.id);
      }

      setCheckingSession(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const sessionUser = session?.user || null;

      setCurrentUser(sessionUser);
      setLogged(Boolean(sessionUser));

      if (sessionUser) {
        await loadUserData(sessionUser.id);
      } else {
        clearAppData();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearAppData = () => {
    setProfile(null);
    setGames([]);
    setMyGames([]);
    setFriends([]);
    setTournaments([]);
    setNotifications([]);
    setStats(null);
    setPlayers([]);
    setMessages([]);
    setSelectedFriend(null);
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };

  const loadUserData = async (userId) => {
    setLoadingData(true);

    try {
      const [
        profileResult,
        gamesResult,
        userGamesResult,
        tournamentResult,
        notificationResult,
        statsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),

        supabase
          .from("games")
          .select("*")
          .order("name"),

        supabase
          .from("user_games")
          .select("*, games(*)")
          .eq("user_id", userId),

        supabase
          .from("tournaments")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),

        supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (profileResult.error) {
        console.error(profileResult.error);
      }

      if (gamesResult.error) {
        console.error(gamesResult.error);
      }

      if (userGamesResult.error) {
        console.error(userGamesResult.error);
      }

      if (tournamentResult.error) {
        console.error(tournamentResult.error);
      }

      if (notificationResult.error) {
        console.error(notificationResult.error);
      }

      if (statsResult.error) {
        console.error(statsResult.error);
      }

      const loadedProfile = profileResult.data;

      if (loadedProfile) {
        setProfile(loadedProfile);

        setProfileForm({
          display_name:
            loadedProfile.display_name ||
            loadedProfile.username ||
            "Gamer",
          username: loadedProfile.username || "",
          bio: loadedProfile.bio || "",
          avatar: loadedProfile.avatar || "",
        });
      }

      setGames(gamesResult.data || []);
      setMyGames(userGamesResult.data || []);
      setTournaments(tournamentResult.data || []);
      setNotifications(notificationResult.data || []);
      setStats(statsResult.data || null);

      await loadFriends(userId);
      await loadPlayers(userId);
    } catch (error) {
      console.error(error);
      showToast("No pudimos cargar todos tus datos");
    } finally {
      setLoadingData(false);
    }
  };

  const loadFriends = async (userId) => {
    const { data, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted");

    if (error) {
      console.error(error);
      setFriends([]);
      return;
    }

    const friendshipRows = data || [];

    if (!friendshipRows.length) {
      setFriends([]);
      return;
    }

    const friendIds = friendshipRows.map((friendship) =>
      friendship.requester_id === userId
        ? friendship.addressee_id
        : friendship.requester_id
    );

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", friendIds);

    if (profilesError) {
      console.error(profilesError);
      setFriends([]);
      return;
    }

    setFriends(profilesData || []);
  };

  const loadPlayers = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, bio, avatar")
      .neq("id", userId)
      .order("username")
      .limit(50);

    if (error) {
      console.error(error);
      setPlayers([]);
      return;
    }

    setPlayers(data || []);
  };

  const loadMessages = async (friendId) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUser.id})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      showToast("No pudimos cargar los mensajes");
      return;
    }

    setMessages(data || []);
  };

  const navigate = (target) => {
    setPage(target);
    setMobileMenu(false);
    setNotificationsOpen(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!authEmail.trim() || !authPassword) {
      showToast("Completá email y contraseña");
      return;
    }

    setAuthLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    });

    setAuthLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        showToast("Primero confirmá tu email 📧");
      } else {
        showToast("Email o contraseña incorrectos");
      }
      return;
    }

    setAuthEmail("");
    setAuthPassword("");
    showToast("¡Bienvenido a GG-Hub! 🎮");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const username = authUsername.trim();

    if (!username) {
      showToast("Elegí un nombre de usuario");
      return;
    }

    if (!authEmail.trim()) {
      showToast("Ingresá tu email");
      return;
    }

    if (authPassword.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (authPassword !== authConfirmPassword) {
      showToast("Las contraseñas no coinciden");
      return;
    }

    setAuthLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: authEmail.trim(),
      password: authPassword,
      options: {
        data: {
          username,
        },
      },
    });

    setAuthLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("username")) {
        showToast("Ese nombre de usuario ya está en uso");
      } else {
        showToast(error.message);
      }
      return;
    }

    if (data.session) {
      showToast("¡Cuenta creada! Bienvenido a GG-Hub 🎮");
    } else {
      showToast("Cuenta creada. Revisá tu email para confirmarla 📧");
      setAuthMode("login");
      setAuthPassword("");
      setAuthConfirmPassword("");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!authEmail.trim()) {
      showToast("Ingresá tu email para recuperar la contraseña");
      return;
    }

    setAuthLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      authEmail.trim(),
      {
        redirectTo: window.location.origin,
      }
    );

    setAuthLoading(false);

    if (error) {
      showToast("No pudimos enviar el email de recuperación");
      return;
    }

    setResetSent(true);
    showToast("Te enviamos un email de recuperación 📧");
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      showToast("Las contraseñas no coinciden");
      return;
    }

    setAuthLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setAuthLoading(false);

    if (error) {
      showToast("No pudimos actualizar la contraseña");
      return;
    }

    setNewPassword("");
    setNewPasswordConfirm("");
    setResetMode(false);
    setResetSent(false);
    setAuthMode("login");

    showToast("Contraseña actualizada correctamente 🔐");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setLogged(false);
    setCurrentUser(null);
    setPage("inicio");
    clearAppData();

    showToast("Sesión cerrada");
  };

  const addGame = async () => {
    if (!currentUser || !games.length) {
      showToast("No hay juegos disponibles todavía");
      return;
    }

    const availableGames = games.filter(
      (game) => !myGames.some((item) => item.game_id === game.id)
    );

    if (!availableGames.length) {
      showToast("Ya agregaste todos los juegos disponibles");
      return;
    }

    const options = availableGames
      .map((game, index) => `${index + 1}. ${game.name}`)
      .join("\n");

    const selected = window.prompt(
      `Elegí el número del juego que querés agregar:\n\n${options}`
    );

    if (!selected) return;

    const index = Number(selected) - 1;

    if (
      Number.isNaN(index) ||
      index < 0 ||
      index >= availableGames.length
    ) {
      showToast("Opción inválida");
      return;
    }

    const selectedGame = availableGames[index];

    const { data, error } = await supabase
      .from("user_games")
      .insert({
        user_id: currentUser.id,
        game_id: selectedGame.id,
      })
      .select("*, games(*)")
      .single();

    if (error) {
      console.error(error);
      showToast("No pudimos agregar el juego");
      return;
    }

    setMyGames((previous) => [...previous, data]);
    showToast(`${selectedGame.name} agregado a tu perfil 🎮`);
  };

  const removeGame = async (userGameId) => {
    const { error } = await supabase
      .from("user_games")
      .delete()
      .eq("id", userGameId)
      .eq("user_id", currentUser.id);

    if (error) {
      console.error(error);
      showToast("No pudimos eliminar el juego");
      return;
    }

    setMyGames((previous) =>
      previous.filter((game) => game.id !== userGameId)
    );

    showToast("Juego eliminado");
  };

  const sendFriendRequest = async (profileId) => {
    if (!currentUser || profileId === currentUser.id) return;

    const { data: existing, error: existingError } = await supabase
      .from("friendships")
      .select("id, status")
      .or(
        `and(requester_id.eq.${currentUser.id},addressee_id.eq.${profileId}),and(requester_id.eq.${profileId},addressee_id.eq.${currentUser.id})`
      )
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
    }

    if (existing) {
      if (existing.status === "accepted") {
        showToast("Ya son amigos");
      } else {
        showToast("Ya existe una solicitud");
      }
      return;
    }

    const { error } = await supabase.from("friendships").insert({
      requester_id: currentUser.id,
      addressee_id: profileId,
      status: "pending",
    });

    if (error) {
      console.error(error);
      showToast("No pudimos enviar la solicitud");
      return;
    }

    showToast("Solicitud de amistad enviada 👥");
  };

  const saveProfile = async () => {
    if (!currentUser) return;

    const cleanUsername = profileForm.username
      .replace(/^@/, "")
      .trim();

    if (!cleanUsername) {
      showToast("El usuario no puede estar vacío");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        display_name: profileForm.display_name.trim() || cleanUsername,
        username: cleanUsername,
        bio: profileForm.bio.trim(),
        avatar: profileForm.avatar.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentUser.id)
      .select()
      .single();

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        showToast("Ese nombre de usuario ya está en uso");
      } else {
        showToast("No pudimos guardar tu perfil");
      }

      return;
    }

    setProfile(data);
    setProfileForm({
      display_name: data.display_name || "",
      username: data.username || "",
      bio: data.bio || "",
      avatar: data.avatar || "",
    });

    showToast("Perfil actualizado correctamente ✓");
  };

  const joinTournament = async (tournament) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from("tournament_players")
      .insert({
        tournament_id: tournament.id,
        user_id: currentUser.id,
      });

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        showToast("Ya estás inscripto en este torneo");
      } else {
        showToast("No pudimos inscribirte en el torneo");
      }

      return;
    }

    showToast(`Te inscribiste en ${tournament.name} 🏆`);
  };

  const selectFriend = async (friend) => {
    setSelectedFriend(friend);
    await loadMessages(friend.id);
  };

  const sendMessage = async () => {
    if (!currentUser || !selectedFriend || !messageText.trim()) return;

    const text = messageText.trim();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser.id,
        receiver_id: selectedFriend.id,
        content: text,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      showToast("No pudimos enviar el mensaje");
      return;
    }

    setMessages((previous) => [...previous, data]);
    setMessageText("");
  };

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read_at
  ).length;

  const filteredGames = useMemo(() => {
    return myGames.filter((item) =>
      item.games?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [myGames, search]);

  const filteredPlayers = useMemo(() => {
    const query = playerSearch.toLowerCase();

    return players.filter(
      (player) =>
        player.username?.toLowerCase().includes(query) ||
        player.display_name?.toLowerCase().includes(query)
    );
  }, [players, playerSearch]);

  const userName =
    profile?.display_name ||
    profile?.username ||
    currentUser?.user_metadata?.username ||
    "Gamer";

  const userUsername = profile?.username
    ? `@${profile.username}`
    : currentUser?.user_metadata?.username
    ? `@${currentUser.user_metadata.username}`
    : "@gamer";

  if (checkingSession) {
    return (
      <div className="auth-page">
        <div className="auth-glow"></div>
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo">GG</div>
            <h1>
              GG<span>-HUB</span>
            </h1>
            <p>Preparando tu experiencia gamer...</p>
          </div>
          <div className="auth-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!logged) {
    if (resetMode) {
      return (
        <div className="auth-page">
          <div className="auth-glow"></div>

          <div className="auth-card">
            <div className="auth-brand">
              <div className="auth-logo">GG</div>
              <h1>
                GG<span>-HUB</span>
              </h1>
              <p>Creá una nueva contraseña segura.</p>
            </div>

            <form className="auth-form" onSubmit={handleUpdatePassword}>
              <div className="auth-field">
                <label>Nueva contraseña</label>

                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>

                  <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label>Repetir contraseña</label>

                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔐</span>

                  <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repetí tu contraseña"
                    value={newPasswordConfirm}
                    onChange={(e) =>
                      setNewPasswordConfirm(e.target.value)
                    }
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                className="auth-submit"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Actualizando..."
                  : "Guardar nueva contraseña →"}
              </button>
            </form>

            <button
              className="secondary-btn full"
              type="button"
              onClick={() => {
                setResetMode(false);
                setResetSent(false);
              }}
            >
              Volver al inicio de sesión
            </button>

            <div className="auth-security">
              <span className="auth-security-icon">🔐</span>
              <span>
                Tu nueva contraseña quedará protegida mediante Supabase.
              </span>
            </div>
          </div>

          {toast && <div className="toast">✓ {toast}</div>}
        </div>
      );
    }

    if (authMode === "forgot") {
      return (
        <div className="auth-page">
          <div className="auth-grid"></div>
          <div className="auth-glow"></div>

          <div className="auth-card">
            <div className="auth-brand">
              <div className="auth-logo">GG</div>
              <h1>
                GG<span>-HUB</span>
              </h1>
              <p>Recuperá el acceso a tu cuenta.</p>
            </div>

            <form className="auth-form" onSubmit={handleForgotPassword}>
              <div className="auth-field">
                <label>Correo electrónico</label>

                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉</span>

                  <input
                    className="auth-input"
                    type="email"
                    placeholder="tuemail@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <button
                className="auth-submit"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Enviando..."
                  : "Enviar enlace de recuperación →"}
              </button>
            </form>

            <button
              className="secondary-btn full"
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthEmail("");
              }}
            >
              Volver a iniciar sesión
            </button>

            <div className="auth-security">
              <span className="auth-security-icon">🔐</span>
              <span>
                Te enviaremos un enlace seguro a tu correo electrónico.
              </span>
            </div>
          </div>

          {toast && <div className="toast">✓ {toast}</div>}
        </div>
      );
    }

    if (resetSent) {
      return (
        <div className="auth-page">
          <div className="auth-glow"></div>

          <div className="auth-card">
            <div className="auth-brand">
              <div className="auth-logo">GG</div>
              <h1>
                GG<span>-HUB</span>
              </h1>
              <p>Revisá tu correo electrónico.</p>
            </div>

            <div className="auth-success">
              <div className="auth-success-icon">✓</div>
              <h2>Email enviado</h2>
              <p>
                Si existe una cuenta con ese correo, recibirás un enlace
                para crear una nueva contraseña.
              </p>
            </div>

            <button
              className="auth-submit"
              type="button"
              onClick={() => {
                setResetSent(false);
                setAuthMode("login");
              }}
            >
              Volver a iniciar sesión →
            </button>

            <div className="auth-security">
              <span className="auth-security-icon">📧</span>
              <span>
                Revisá también la carpeta de spam o correo no deseado.
              </span>
            </div>
          </div>

          {toast && <div className="toast">✓ {toast}</div>}
        </div>
      );
    }

    return (
      <div className="auth-page">
        <div className="auth-grid"></div>
        <div className="auth-glow"></div>

        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo">GG</div>

            <h1>
              GG<span>-HUB</span>
            </h1>

            <p>
              {authMode === "login"
                ? "Bienvenido de nuevo, gamer."
                : "Creá tu cuenta y encontrá tu squad."}
            </p>
          </div>

          <div className="auth-mode">
            <button
              type="button"
              className={authMode === "login" ? "active" : ""}
              onClick={() => {
                setAuthMode("login");
                setAuthPassword("");
                setAuthConfirmPassword("");
              }}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className={authMode === "register" ? "active" : ""}
              onClick={() => {
                setAuthMode("register");
                setAuthPassword("");
              }}
            >
              Crear cuenta
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={
              authMode === "login" ? handleLogin : handleRegister
            }
          >
            {authMode === "register" && (
              <div className="auth-field">
                <label>Nombre de usuario</label>

                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>

                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Ej: JuanGG"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label>Correo electrónico</label>

              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉</span>

                <input
                  className="auth-input"
                  type="email"
                  placeholder="tuemail@gmail.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Contraseña</label>

              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>

                <input
                  className="auth-input password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  autoComplete={
                    authMode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {authMode === "register" && (
              <div className="auth-field">
                <label>Repetir contraseña</label>

                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔐</span>

                  <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repetí tu contraseña"
                    value={authConfirmPassword}
                    onChange={(e) =>
                      setAuthConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {authMode === "login" && (
              <div className="auth-options">
                <label className="remember-check">
                  <input type="checkbox" />
                  <span>Recordarme</span>
                </label>

                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() => {
                    setResetSent(false);
                    setAuthMode("forgot");
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={authLoading}
            >
              {authLoading
                ? "Procesando..."
                : authMode === "login"
                ? "Entrar a GG-Hub →"
                : "Crear mi cuenta →"}
            </button>
          </form>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <button
            className="secondary-btn full"
            type="button"
            onClick={() => {
              setAuthMode(
                authMode === "login" ? "register" : "login"
              );
              setShowPassword(false);
              setAuthPassword("");
              setAuthConfirmPassword("");
            }}
          >
            {authMode === "login"
              ? "Crear una cuenta"
              : "Ya tengo una cuenta"}
          </button>

          <div className="auth-security">
            <span className="auth-security-icon">🔐</span>
            <span>
              Tu cuenta está protegida mediante autenticación segura.
            </span>
          </div>
        </div>

        {toast && <div className="toast">✓ {toast}</div>}
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

      <aside
        className={
          mobileMenu ? "sidebar mobile-open" : "sidebar"
        }
      >
        <div className="sidebar-logo">
          <div className="brand-mark">GG</div>

          <div>
            <strong>GG-HUB</strong>
            <small>GAMER NETWORK</small>
          </div>
        </div>

        <div className="sidebar-section">
          <span>MENÚ</span>

          {[
            ["inicio", "⌂", "Inicio"],
            ["juegos", "🎮", "Mis juegos"],
            ["torneos", "🏆", "Torneos"],
            ["amigos", "👥", "Amigos"],
            ["mensajes", "💬", "Mensajes"],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              className={
                page === id ? "nav-item active" : "nav-item"
              }
              onClick={() => navigate(id)}
            >
              <span>{icon}</span>
              {label}

              {id === "mensajes" && friends.length > 0 && (
                <b className="nav-badge">{friends.length}</b>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-section">
          <span>CUENTA</span>

          {[
            ["perfil", "👤", "Mi perfil"],
            ["estadisticas", "📊", "Estadísticas"],
            ["configuracion", "⚙️", "Configuración"],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              className={
                page === id ? "nav-item active" : "nav-item"
              }
              onClick={() => navigate(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">⚡</div>
            <strong>GG-Hub PRO</strong>
            <p>Nuevas funciones próximamente.</p>

            <button
              onClick={() =>
                showToast("GG-Hub PRO llegará próximamente")
              }
            >
              Saber más
            </button>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
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
              {{
                inicio: "Inicio",
                juegos: "Mis juegos",
                torneos: "Torneos",
                amigos: "Amigos",
                mensajes: "Mensajes",
                perfil: "Mi perfil",
                estadisticas: "Estadísticas",
                configuracion: "Configuración",
              }[page]}
            </strong>
          </div>

          <div className="topbar-actions">
            <div className="search-wrapper">
              <span>⌕</span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tus juegos..."
              />
            </div>

            <div className="notification-wrapper">
              <button
                className="icon-btn"
                onClick={() =>
                  setNotificationsOpen(!notificationsOpen)
                }
              >
                🔔

                {unreadNotifications > 0 && <i></i>}
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <strong>Notificaciones</strong>
                    <span>{unreadNotifications} nuevas</span>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="notification-item">
                      <div>🔔</div>
                      <p>No tenés notificaciones nuevas.</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        className="notification-item"
                        key={notification.id}
                      >
                        <div>🔔</div>
                        <p>
                          <strong>
                            {notification.title || "GG-Hub"}
                          </strong>
                          <br />
                          {notification.message || ""}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              className="top-profile"
              onClick={() => navigate("perfil")}
            >
              <div className="avatar">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{userName}</strong>
                <small>Online</small>
              </div>

              <span>⌄</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          {loadingData && (
            <div className="loading-data">
              <div className="loading-spinner"></div>
            </div>
          )}

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
                      <strong>Torneos</strong>
                      <small>
                        {tournaments.length} disponibles
                      </small>
                    </div>
                  </div>

                  <div className="floating-card card-two">
                    <span>👥</span>

                    <div>
                      <strong>Jugadores</strong>
                      <small>Encontrá tu squad</small>
                    </div>
                  </div>
                </div>
              </section>

              <section className="welcome-row">
                <div>
                  <span className="eyebrow">TU ACTIVIDAD</span>
                  <h2>
                    Todo tu mundo gamer, en un solo lugar.
                  </h2>
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
                    <strong>{tournaments.length}</strong>
                    <span>disponibles</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">👥</div>

                  <div>
                    <small>Amigos</small>
                    <strong>{friends.length}</strong>
                    <span>en tu red</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⚡</div>

                  <div>
                    <small>GG XP</small>
                    <strong>{stats?.xp ?? 0}</strong>
                    <span>tu experiencia</span>
                  </div>
                </div>
              </section>

              <section className="dashboard-grid">
                <div className="panel large-panel">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">
                        COMPETICIÓN
                      </span>

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
                    {tournaments.length === 0 ? (
                      <div className="empty-state">
                        <div>🏆</div>
                        <h3>No hay torneos todavía</h3>
                        <p>
                          Cuando haya torneos publicados
                          aparecerán acá.
                        </p>
                      </div>
                    ) : (
                      tournaments.slice(0, 5).map((tournament) => (
                        <div
                          className="tournament-row"
                          key={tournament.id}
                        >
                          <div className="tournament-game">
                            <div className="game-icon">
                              {getGameIcon(tournament.game)}
                            </div>

                            <div>
                              <strong>{tournament.name}</strong>
                              <span>{tournament.game}</span>
                            </div>
                          </div>

                          <div className="tournament-info">
                            <span>Premio</span>
                            <strong>
                              {tournament.prize || "A definir"}
                            </strong>
                          </div>

                          <div className="tournament-info">
                            <span>Jugadores</span>
                            <strong>
                              {tournament.max_players || "—"}
                            </strong>
                          </div>

                          <div className="tournament-date">
                            <small>
                              {tournament.start_at
                                ? new Date(
                                    tournament.start_at
                                  ).toLocaleDateString("es-AR")
                                : "—"}
                            </small>
                          </div>

                          <button
                            className="small-btn"
                            onClick={() =>
                              joinTournament(tournament)
                            }
                          >
                            Unirse
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">
                        TU SQUAD
                      </span>

                      <h3>Amigos</h3>
                    </div>

                    <span className="online-count">
                      {friends.length}
                    </span>
                  </div>

                  <div className="friends-list">
                    {friends.length === 0 ? (
                      <div className="empty-state">
                        <div>👥</div>
                        <p>
                          Todavía no tenés amigos agregados.
                        </p>
                      </div>
                    ) : (
                      friends.slice(0, 5).map((friend) => (
                        <div
                          className="friend-row"
                          key={friend.id}
                        >
                          <div className="friend-avatar">
                            {(
                              friend.display_name ||
                              friend.username ||
                              "G"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="friend-info">
                            <strong>
                              {friend.display_name ||
                                friend.username}
                            </strong>

                            <span>
                              🟢 Disponible
                            </span>
                          </div>

                          <button
                            className="friend-chat"
                            onClick={() => {
                              navigate("mensajes");
                              selectFriend(friend);
                            }}
                          >
                            💬
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    className="secondary-btn full"
                    onClick={() => navigate("amigos")}
                  >
                    Ver amigos
                  </button>
                </div>
              </section>
            </>
          )}

          {page === "juegos" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    TU PERFIL GAMER
                  </span>

                  <h1>Mis juegos</h1>

                  <p>
                    Agregá los juegos que realmente jugás.
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={addGame}
                >
                  + Agregar juego
                </button>
              </div>

              <div className="games-grid">
                {filteredGames.length === 0 ? (
                  <div className="empty-state">
                    <div>🎮</div>
                    <h3>Todavía no agregaste juegos</h3>
                    <p>
                      Agregá tus juegos para completar tu perfil
                      gamer.
                    </p>
                  </div>
                ) : (
                  filteredGames.map((item) => {
                    const game = item.games;

                    return (
                      <div
                        className="game-card"
                        key={item.id}
                      >
                        <div className="game-card-top">
                          <div className="game-large-icon">
                            {getGameIcon(game?.name)}
                          </div>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              removeGame(item.id)
                            }
                          >
                            ×
                          </button>
                        </div>

                        <h3>{game?.name}</h3>

                        <span className="game-rank">
                          Juego agregado
                        </span>

                        <div className="game-card-footer">
                          <span>En tu perfil</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {page === "torneos" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">COMPETÍ</span>
                  <h1>Torneos</h1>
                  <p>
                    Competí contra otros jugadores de
                    GG-Hub.
                  </p>
                </div>
              </div>

              <div className="tournaments-grid">
                {tournaments.length === 0 ? (
                  <div className="empty-state">
                    <div>🏆</div>
                    <h3>No hay torneos publicados</h3>
                    <p>
                      Cuando se publique un torneo aparecerá
                      acá.
                    </p>
                  </div>
                ) : (
                  tournaments.map((tournament) => (
                    <div
                      className="tournament-card"
                      key={tournament.id}
                    >
                      <div className="tournament-cover">
                        <span>
                          {getGameIcon(tournament.game)}
                        </span>

                        <small>{tournament.game}</small>
                      </div>

                      <div className="tournament-card-body">
                        <span className="status-pill">
                          INSCRIPCIONES
                        </span>

                        <h3>{tournament.name}</h3>

                        <div className="tournament-meta">
                          <div>
                            <small>Premio</small>
                            <strong>
                              {tournament.prize || "A definir"}
                            </strong>
                          </div>

                          <div>
                            <small>Jugadores</small>
                            <strong>
                              {tournament.max_players || "—"}
                            </strong>
                          </div>

                          <div>
                            <small>Fecha</small>
                            <strong>
                              {tournament.start_at
                                ? new Date(
                                    tournament.start_at
                                  ).toLocaleDateString("es-AR")
                                : "—"}
                            </strong>
                          </div>
                        </div>

                        <button
                          className="primary-btn full"
                          onClick={() =>
                            joinTournament(tournament)
                          }
                        >
                          Unirme al torneo
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {page === "amigos" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    TU COMUNIDAD
                  </span>

                  <h1>Amigos</h1>

                  <p>
                    Encontrá jugadores reales dentro de
                    GG-Hub.
                  </p>
                </div>
              </div>

              <div className="panel search-players-panel">
                <div className="panel-header">
                  <div>
                    <span className="eyebrow">
                      JUGADORES
                    </span>

                    <h3>Buscar jugadores</h3>
                  </div>
                </div>

                <div className="search-wrapper">
                  <span>⌕</span>

                  <input
                    value={playerSearch}
                    onChange={(e) =>
                      setPlayerSearch(e.target.value)
                    }
                    placeholder="Buscar por usuario..."
                  />
                </div>
              </div>

              <div className="friends-grid">
                {filteredPlayers.length === 0 ? (
                  <div className="empty-state">
                    <div>👥</div>
                    <h3>No encontramos jugadores</h3>
                    <p>
                      Probá con otro nombre de usuario.
                    </p>
                  </div>
                ) : (
                  filteredPlayers.map((player) => (
                    <div
                      className="friend-card"
                      key={player.id}
                    >
                      <div className="friend-card-avatar">
                        {(
                          player.display_name ||
                          player.username ||
                          "G"
                        )
                          .charAt(0)
                          .toUpperCase()}
                        <i></i>
                      </div>

                      <h3>
                        {player.display_name ||
                          player.username}
                      </h3>

                      <span>
                        @{player.username}
                      </span>

                      <div className="friend-card-actions">
                        <button
                          className="primary-btn"
                          onClick={() =>
                            sendFriendRequest(player.id)
                          }
                        >
                          Agregar
                        </button>

                        <button
                          className="secondary-btn"
                          onClick={() => {
                            setSelectedFriend(player);
                            navigate("mensajes");
                            loadMessages(player.id);
                          }}
                        >
                          Mensaje
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {page === "mensajes" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    COMUNIDAD
                  </span>

                  <h1>Mensajes</h1>

                  <p>
                    Hablá con tus amigos de GG-Hub.
                  </p>
                </div>
              </div>

              <div className="messages-layout">
                <div className="conversation-list">
                  {friends.length === 0 ? (
                    <div className="empty-state">
                      <div>💬</div>
                      <p>
                        Agregá amigos para comenzar a
                        conversar.
                      </p>
                    </div>
                  ) : (
                    friends.map((friend) => (
                      <button
                        className={
                          selectedFriend?.id === friend.id
                            ? "conversation active"
                            : "conversation"
                        }
                        key={friend.id}
                        onClick={() =>
                          selectFriend(friend)
                        }
                      >
                        <div className="friend-avatar">
                          {(
                            friend.display_name ||
                            friend.username ||
                            "G"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {friend.display_name ||
                              friend.username}
                          </strong>

                          <span>
                            Abrir conversación
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="chat-panel">
                  {!selectedFriend ? (
                    <div className="empty-state">
                      <div>💬</div>
                      <h3>Elegí una conversación</h3>
                      <p>
                        Seleccioná un amigo para ver los
                        mensajes.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="chat-header">
                        <div className="friend-avatar">
                          {(
                            selectedFriend.display_name ||
                            selectedFriend.username ||
                            "G"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {selectedFriend.display_name ||
                              selectedFriend.username}
                          </strong>

                          <span>
                            @{selectedFriend.username}
                          </span>
                        </div>
                      </div>

                      <div className="chat-messages">
                        {messages.length === 0 ? (
                          <div className="empty-state">
                            <div>👋</div>
                            <p>
                              Todavía no hay mensajes.
                            </p>
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div
                              className={
                                message.sender_id ===
                                currentUser.id
                                  ? "message sent"
                                  : "message received"
                              }
                              key={message.id}
                            >
                              <span>
                                {message.content}
                              </span>

                              <small>
                                {message.created_at
                                  ? new Date(
                                      message.created_at
                                    ).toLocaleTimeString(
                                      "es-AR",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : ""}
                              </small>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="chat-input">
                        <input
                          value={messageText}
                          onChange={(e) =>
                            setMessageText(e.target.value)
                          }
                          placeholder="Escribí un mensaje..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              sendMessage();
                            }
                          }}
                        />

                        <button onClick={sendMessage}>
                          ➤
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

          {page === "estadisticas" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    TU RENDIMIENTO
                  </span>

                  <h1>Estadísticas</h1>

                  <p>
                    Datos reales registrados en GG-Hub.
                  </p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">⚔️</div>

                  <div>
                    <small>Partidas</small>
                    <strong>
                      {stats?.matches_played ?? 0}
                    </strong>
                    <span>registradas</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🏆</div>

                  <div>
                    <small>Victorias</small>
                    <strong>
                      {stats?.wins ?? 0}
                    </strong>
                    <span>registradas</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⚡</div>

                  <div>
                    <small>GG XP</small>
                    <strong>{stats?.xp ?? 0}</strong>
                    <span>experiencia</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🔥</div>

                  <div>
                    <small>Racha</small>
                    <strong>
                      {stats?.win_streak ?? 0}
                    </strong>
                    <span>victorias seguidas</span>
                  </div>
                </div>
              </div>

              <div className="statistics-layout">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">
                        ACTIVIDAD
                      </span>

                      <h3>Tu actividad</h3>
                    </div>
                  </div>

                  <div className="empty-state">
                    <div>📊</div>

                    <h3>
                      Todavía no hay suficiente actividad
                    </h3>

                    <p>
                      Tus estadísticas aparecerán a medida
                      que uses GG-Hub.
                    </p>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">
                        PERFIL
                      </span>

                      <h3>Resumen</h3>
                    </div>
                  </div>

                  <div className="ranking-position">
                    <strong>{stats?.xp ?? 0}</strong>
                    <span>GG XP acumulada</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {page === "perfil" && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    IDENTIDAD GAMER
                  </span>

                  <h1>Mi perfil</h1>

                  <p>
                    Este es tu perfil público de GG-Hub.
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={saveProfile}
                >
                  Guardar cambios
                </button>
              </div>

              <div className="profile-layout">
                <div className="profile-card">
                  <div className="profile-cover"></div>

                  <div className="profile-main">
                    <div className="profile-big-avatar">
                      {userName.charAt(0).toUpperCase()}
                    </div>

                    <div className="profile-name">
                      <h2>{userName}</h2>
                      <span>{userUsername}</span>
                    </div>

                    <div className="profile-status">
                      <i></i>
                      Online
                    </div>

                    <p>
                      {profile?.bio ||
                        "Todavía no agregaste una biografía."}
                    </p>

                    <div className="profile-tags">
                      <span>🎮 Gamer</span>
                      <span>👥 GG-Hub</span>
                    </div>
                  </div>
                </div>

                <div className="panel profile-edit">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">
                        DATOS
                      </span>

                      <h3>Editar perfil</h3>
                    </div>
                  </div>

                  <label>
                    Nombre
                    <input
                      value={profileForm.display_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          display_name: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Usuario
                    <input
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          username: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Biografía
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          bio: e.target.value,
                        })
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
                  <span className="eyebrow">
                    PERSONALIZACIÓN
                  </span>

                  <h1>Configuración</h1>

                  <p>
                    Configurá tu experiencia en GG-Hub.
                  </p>
                </div>
              </div>

              <div className="settings-list">
                <div className="setting-row">
                  <div>
                    <strong>Apariencia</strong>
                    <span>
                      Cambiar el aspecto de GG-Hub.
                    </span>
                  </div>

                  <button
                    className="toggle-setting"
                    onClick={() =>
                      setDarkMode(!darkMode)
                    }
                  >
                    {darkMode ? "🌙 Oscuro" : "☀️ Claro"}
                  </button>
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Cuenta</strong>
                    <span>
                      Tu cuenta está protegida mediante
                      Supabase.
                    </span>
                  </div>

                  <span>🔐</span>
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Email</strong>
                    <span>
                      {currentUser?.email || ""}
                    </span>
                  </div>

                  <span>✉</span>
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Sesión</strong>
                    <span>
                      Cerrar sesión de GG-Hub en este
                      dispositivo.
                    </span>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
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