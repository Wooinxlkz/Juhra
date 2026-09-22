import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowBigDown,
  ArrowBigUp,
  ArrowUpRight,
  Bell,
  BellRing,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Circle,
  Clock,
  CornerDownRight,
  Download,
  Eye,
  Flame,
  Gamepad2,
  Grid2X2,
  Home as HomeIcon,
  Lightbulb,
  List,
  Lock,
  LogOut,
  MessageCircle,
  Minus,
  Pin,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  ThumbsUp,
  Trophy,
  UserPlus,
  UserRound,
  Users,
  UsersRound,
  Volume2,
  X,
  Moon,
} from 'lucide-react';
import { Link, Router as WouterRouter, useLocation } from 'wouter';
import { minimizeWindow, closeWindow } from './lib/window-controls';
import './reference-client.css';
import type { GameTheme } from './games/types';
import { ashenReachTheme } from './games/ashen-reach/theme';
import './games/ashen-reach/theme.css';
import { redAssemblyTheme } from './games/red-assembly/theme';
import './games/red-assembly/theme.css';
import { blueEchoTheme } from './games/blue-echo/theme';
import './games/blue-echo/theme.css';
import { palaceOfDustTheme } from './games/palace-of-dust/theme';
import './games/palace-of-dust/theme.css';
import JuhraSignInGate from './JuhraSignInGate';
import juhraHelmetLogo from '../assets/juhra-helmet-logo.png';
import juhraHelmetLogoLight from '../assets/juhra-helmet-logo-light.png';

type Game = {
  id: string;
  title: string;
  glyph: string;
  subtitle: string;
  genre: string;
  art: string;
  status: 'Installed' | 'New';
  theme: GameTheme;
};

const games: Game[] = [
  {
    id: 'ashen-reach',
    title: 'Ashen Reach',
    glyph: 'A',
    subtitle: 'The last signal from below.',
    genre: 'Narrative adventure',
    art: 'reference-art-ashen',
    status: 'Installed',
    theme: ashenReachTheme,
  },
  {
    id: 'red-assembly',
    title: 'Red Assembly',
    glyph: 'R',
    subtitle: 'The city votes at midnight.',
    genre: 'Tactical strategy',
    art: 'reference-art-red',
    status: 'Installed',
    theme: redAssemblyTheme,
  },
  {
    id: 'blue-echo',
    title: 'Blue Echo',
    glyph: 'B',
    subtitle: 'Nothing disappears underwater.',
    genre: 'Exploration puzzle',
    art: 'reference-art-blue',
    status: 'New',
    theme: blueEchoTheme,
  },
  {
    id: 'palace-of-dust',
    title: 'Palace of Dust',
    glyph: 'P',
    subtitle: 'Every room remembers.',
    genre: 'RPG / solitary',
    art: 'reference-art-palace',
    status: 'Installed',
    theme: palaceOfDustTheme,
  },
];

// ---------------------------------------------------------------------
// Store — games not yet in the player's library. Uses the same `art`
// class convention as `games` (a CSS gradient background, see
// reference-client.css), just with three new classes added for these.
// Session-only: "owned" additions from the Store live in Client()'s
// `libraryAdditions` state, not here, so this array itself never changes.
// ---------------------------------------------------------------------
type StoreGame = {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  price: string;
  art: string;
};

const storeGames: StoreGame[] = [
  {
    id: 'hollow-frequency',
    title: 'Hollow Frequency',
    tagline: 'Something is still broadcasting from the station.',
    genre: 'Horror adventure',
    price: '$24.99',
    art: 'reference-art-hollow',
  },
  {
    id: 'glasswing',
    title: 'Glasswing',
    tagline: 'Every choice leaves a mark on the wing.',
    genre: 'Narrative strategy',
    price: '$19.99',
    art: 'reference-art-glasswing',
  },
  {
    id: 'last-ember',
    title: 'Last Ember',
    tagline: 'The fire remembers who fed it.',
    genre: 'Survival RPG',
    price: '$29.99',
    art: 'reference-art-ember',
  },
];

// ---------------------------------------------------------------------
// Notifications — client-wide, shown from the Bell menu in the Topbar.
// Session-only like everything else without a backend (see the
// Community section comment further down for the general pattern).
// ---------------------------------------------------------------------
type NotificationKind = 'friend' | 'achievement' | 'patch' | 'system';
type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    kind: 'friend',
    title: 'Mara Voss is now playing Ashen Reach',
    body: 'Jump in and explore together.',
    time: '12m ago',
    read: false,
  },
  {
    id: 'n2',
    kind: 'achievement',
    title: 'Achievement unlocked in Red Assembly',
    body: '"First Vote" — cast your first ballot in the Assembly.',
    time: '1h ago',
    read: false,
  },
  {
    id: 'n3',
    kind: 'patch',
    title: 'Blue Echo update 1.3.05 is live',
    body: 'New field events, balance tuning, and quality-of-life changes.',
    time: '5h ago',
    read: false,
  },
  {
    id: 'n4',
    kind: 'friend',
    title: 'Jules Ahn sent you a party invite',
    body: 'Palace of Dust · Expires in 20 minutes.',
    time: '6h ago',
    read: true,
  },
  {
    id: 'n5',
    kind: 'system',
    title: 'Welcome to Juhra',
    body: 'Your account is ready. Explore your library to get started.',
    time: '2d ago',
    read: true,
  },
];

// ---------------------------------------------------------------------
// Achievements — per game, shown as a GameHub tab. Session-only state
// (see DiscussionsSection etc. below for the same pattern): unlocking
// one during a session updates the on-screen progress, but resets next
// launch since there's no backend to persist it to.
// ---------------------------------------------------------------------
type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedOn?: string;
  rarity: number; // percent of players who have this
};

function seedAchievements(game: Game): Achievement[] {
  return [
    { id: 'a1', title: 'First Steps', description: `Begin your journey into ${game.title}.`, unlocked: true, unlockedOn: '3w ago', rarity: 96 },
    { id: 'a2', title: 'Off the Path', description: 'Find a location the story never points you toward.', unlocked: true, unlockedOn: '3w ago', rarity: 61 },
    { id: 'a3', title: 'Close Read', description: 'Read every collectible note in a single act.', unlocked: true, unlockedOn: '2w ago', rarity: 34 },
    { id: 'a4', title: 'No Loose Ends', description: 'Resolve every open thread before the midpoint.', unlocked: false, rarity: 22 },
    { id: 'a5', title: 'The Long Way', description: `Finish ${game.title} without skipping a single optional scene.`, unlocked: false, rarity: 9 },
    { id: 'a6', title: 'Ghost', description: 'Complete a full act without being detected once.', unlocked: false, rarity: 4 },
  ];
}

const homeStories = [
  {
    eyebrow: 'NEW TRANSMISSION · ASHEN REACH',
    title: 'The water keeps its secrets.',
    copy: 'Descend beneath the quiet surface. A new chapter has surfaced in the ruins of the Reach.',
    art: 'reference-art-home',
    action: 'Open Ashen Reach',
    game: 'ashen-reach',
  },
  {
    eyebrow: 'PATCH 2.4 · RED ASSEMBLY',
    title: 'The city votes at midnight.',
    copy: 'Build your coalition, spend your favors, and decide which future gets a seat at the table.',
    art: 'reference-art-red',
    action: 'Open Red Assembly',
    game: 'red-assembly',
  },
];

type OverviewCard = {
  label: string;
  title: string;
  kind: 'video' | 'merch';
  duration?: string;
};

const overviewCards: Record<string, OverviewCard[]> = {
  'ashen-reach': [
    { label: 'FIELD NOTE', title: 'The first signal from below', kind: 'video', duration: '01:21' },
    { label: 'GAME UPDATE', title: 'A new route opens beneath the Reach', kind: 'video', duration: '01:43' },
    { label: 'MERCH', title: 'Ashen Reach field kit', kind: 'merch' },
  ],
  'red-assembly': [
    { label: 'FIELD NOTE', title: 'The city votes at midnight', kind: 'video', duration: '01:21' },
    { label: 'GAME UPDATE', title: 'Coalition tactics for the final hour', kind: 'video', duration: '01:43' },
    { label: 'MERCH', title: 'Red Assembly council set', kind: 'merch' },
  ],
  'blue-echo': [
    { label: 'FIELD NOTE', title: 'Nothing disappears underwater', kind: 'video', duration: '01:21' },
    { label: 'GAME UPDATE', title: 'A deeper echo answers back', kind: 'video', duration: '01:43' },
    { label: 'MERCH', title: 'Blue Echo dive archive', kind: 'merch' },
  ],
  'palace-of-dust': [
    { label: 'FIELD NOTE', title: 'Every room remembers', kind: 'video', duration: '01:21' },
    { label: 'GAME UPDATE', title: 'The inner court wakes again', kind: 'video', duration: '01:43' },
    { label: 'MERCH', title: 'Palace of Dust relics', kind: 'merch' },
  ],
};

function JuhraMark({ wordmark = false }: { wordmark?: boolean }) {
  return (
    <Link
      href="/"
      className={wordmark ? 'reference-wordmark reference-logo-link' : 'reference-mark reference-logo-link'}
      aria-label="Go to Juhra home"
    >
      <img className="reference-logo-image reference-logo-image-dark" src={juhraHelmetLogo} alt="" aria-hidden="true" />
      <img className="reference-logo-image reference-logo-image-light" src={juhraHelmetLogoLight} alt="" aria-hidden="true" />
      {wordmark && <span className="reference-wordmark-text">JUHRA</span>}
    </Link>
  );
}

function SidebarTooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 120);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setOpen(false);
  };
  return (
    <span
      className="reference-tooltip-anchor"
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            className="reference-tooltip"
            initial={{ opacity: 0, x: -4, scale: .96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -3, scale: .97 }}
            transition={{ duration: .14, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
          >
            <span className="reference-tooltip-surface">{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function Rail({
  path,
  activeGame,
  onFriends,
  onAccount,
  onSettings,
  settingsOpen,
}: {
  path: string;
  activeGame: Game | null;
  onFriends: () => void;
  onAccount: () => void;
  onSettings: () => void;
  settingsOpen: boolean;
}) {
  const gamesRail = [
    { id: 'ashen-reach', glyph: 'A' },
    { id: 'red-assembly', glyph: 'R' },
    { id: 'blue-echo', glyph: 'B' },
    { id: 'palace-of-dust', glyph: 'P' },
  ];
  return (
    <aside className="reference-rail">
      <div className="reference-rail-top">
        <JuhraMark />
      </div>
      <nav className="reference-rail-nav" aria-label="Juhra navigation">
        <SidebarTooltip label="Home">
          <Link
            href="/"
            aria-label="Home"
            className={`reference-rail-button ${path === '/' ? 'is-active' : ''}`}
          >
            {path === '/' && <motion.span layoutId="rail-active" className="reference-rail-active-glow" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
            <HomeIcon size={17} />
          </Link>
        </SidebarTooltip>
        <SidebarTooltip label="Games">
          <Link
            href="/games"
            aria-label="Games"
            className={`reference-rail-button ${path === '/games' ? 'is-active' : ''}`}
          >
            {path === '/games' && <motion.span layoutId="rail-active" className="reference-rail-active-glow" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
            <Grid2X2 size={17} />
          </Link>
        </SidebarTooltip>
        <SidebarTooltip label="Library">
          <Link
            href="/library"
            aria-label="Library"
            className={`reference-rail-button ${path === '/library' ? 'is-active' : ''}`}
          >
            {path === '/library' && <motion.span layoutId="rail-active" className="reference-rail-active-glow" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
            <List size={17} />
          </Link>
        </SidebarTooltip>
        <SidebarTooltip label="Store">
          <Link
            href="/store"
            aria-label="Store"
            className={`reference-rail-button ${path === '/store' ? 'is-active' : ''}`}
          >
            {path === '/store' && <motion.span layoutId="rail-active" className="reference-rail-active-glow" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
            <ShoppingBag size={17} />
          </Link>
        </SidebarTooltip>
        <div className="reference-rail-divider" />
        {gamesRail.map((item) => (
          <SidebarTooltip key={item.id} label={games.find((game) => game.id === item.id)?.title ?? item.id}>
            <Link
              href={`/games/${item.id}`}
              aria-label={games.find((game) => game.id === item.id)?.title}
              className={`reference-game-rail reference-game-rail-${item.id} ${path === `/games/${item.id}` ? 'is-active' : ''}`}
            >
              {path === `/games/${item.id}` && <motion.span layoutId="rail-active" className="reference-rail-active-glow" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
              {item.glyph}
            </Link>
          </SidebarTooltip>
        ))}
        <div className="reference-rail-divider" />
        <SidebarTooltip label="Friends">
          <button className="reference-rail-button" onClick={onFriends} aria-label="Friends">
            <Users size={17} />
          </button>
        </SidebarTooltip>
        <SidebarTooltip label="Account">
          <button className="reference-rail-button" onClick={onAccount} aria-label="Account">
            <UserRound size={17} />
          </button>
        </SidebarTooltip>
      </nav>
      <SidebarTooltip label="Settings">
        <button type="button" onClick={onSettings} aria-label="Settings" className={`reference-rail-button reference-rail-settings ${settingsOpen ? 'is-active' : ''}`}>
          {settingsOpen && <motion.span layoutId="rail-active" className="reference-rail-active-glow" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
          <Settings size={17} />
        </button>
      </SidebarTooltip>
    </aside>
  );
}

type SocialTab = 'friends' | 'chat' | 'add';
type SocialMode = 'friends' | 'in-game';

function RiotAvatar({ size = 'small', muted = false }: { size?: 'small' | 'large'; muted?: boolean }) {
  return (
    <span className={`riot-avatar riot-avatar-${size} ${muted ? 'is-muted' : ''}`}>
      <UserRound size={size === 'large' ? 25 : 16} strokeWidth={2.6} />
      {!muted && <i className="riot-avatar-online" />}
    </span>
  );
}

function Topbar({
  title,
  onFriends,
  onGameMenu,
  onAccount,
  onNotifications,
  unreadCount,
  theme,
  onThemeToggle,
}: {
  title: string;
  onFriends: () => void;
  onGameMenu: () => void;
  onAccount: () => void;
  onNotifications: () => void;
  unreadCount: number;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}) {
  return (
    <header className="reference-topbar">
      <div className="reference-topbar-draghandle" data-tauri-drag-region="" />
      <div className="reference-topbar-title" data-tauri-drag-region="">{title}</div>
      <div className="reference-topbar-actions">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <button
          type="button"
          className="reference-notif-bell"
          onClick={onNotifications}
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          aria-haspopup="menu"
        >
          {unreadCount > 0 ? <BellRing size={15} /> : <Bell size={15} />}
          {unreadCount > 0 && <span className="reference-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <div className="reference-status-pill" aria-label="Social and account controls">
          <button className="reference-status-game" onClick={onGameMenu} aria-label="Open game menu" aria-haspopup="menu">
            <Gamepad2 size={14} />
            <strong>1</strong>
          </button>
          <button className="reference-status-account" onClick={onAccount} aria-label="Open account menu">
            <RiotAvatar />
          </button>
          <button className="reference-status-exit" onClick={onFriends} aria-label="Open friends and chat">
            <LogOut size={13} />
          </button>
        </div>
        <div className="reference-window-controls" aria-label="Window controls">
          <button
            type="button"
            className="reference-window-button reference-window-minimize"
            onClick={() => void minimizeWindow()}
            aria-label="Minimize window"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="reference-window-button reference-window-close"
            onClick={() => void closeWindow()}
            aria-label="Close window"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: 'dark' | 'light'; onToggle: () => void }) {
  const isLight = theme === 'light';

  return (
    <button
      className={`reference-theme-toggle ${isLight ? 'is-light' : 'is-dark'}`}
      type="button"
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      aria-pressed={isLight}
      onClick={onToggle}
    >
      <motion.span
        className="reference-theme-toggle-thumb"
        animate={{ x: isLight ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 460, damping: 28 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            className="reference-theme-toggle-icon"
            initial={{ opacity: 0, rotate: isLight ? -75 : 75, scale: .55 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: isLight ? 75 : -75, scale: .55 }}
            transition={{ duration: .2, ease: 'easeOut' }}
          >
            {isLight ? <Sun size={13} strokeWidth={2.4} /> : <Moon size={12} strokeWidth={2.4} />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <span className="reference-theme-toggle-option reference-theme-toggle-moon" aria-hidden="true"><Moon size={10} /></span>
      <span className="reference-theme-toggle-option reference-theme-toggle-sun" aria-hidden="true"><Sun size={11} /></span>
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  icon = 'gamepad',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: 'gamepad' | 'play';
  className?: string;
}) {
  return (
    <button className={`reference-primary-button ${className}`.trim()} onClick={onClick}>
      {icon === 'play' ? <Play size={14} fill="currentColor" /> : <Gamepad2 size={14} />}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button className="reference-secondary-button" onClick={onClick}>
      {children}
    </button>
  );
}

function StoryCard({ story }: { story: (typeof homeStories)[number] }) {
  return (
    <article className="reference-story-card">
      <div className={`reference-story-image ${story.art}`} />
      <div className="reference-story-copy">
        <span>{story.eyebrow}</span>
        <h3>{story.title}</h3>
        <p>{story.copy}</p>
      </div>
    </article>
  );
}

function Home({ onOpenGame, onFriends }: { onOpenGame: (id: string) => void; onFriends: () => void }) {
  const [storyIndex, setStoryIndex] = useState(0);
  const story = homeStories[storyIndex];
  return (
    <main className="reference-page">
      <section className={`reference-home-hero ${story.art}`}>
        <div className="reference-hero-overlay" />
        <div className="reference-home-copy">
          <div className="reference-kicker">{story.eyebrow}</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={story.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h1>{story.title}</h1>
              <p>{story.copy}</p>
              <div className="reference-hero-actions">
                <PrimaryButton onClick={() => onOpenGame(story.game)}>{story.action}</PrimaryButton>
                <SecondaryButton onClick={() => onFriends()}>Watch field note</SecondaryButton>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="reference-story-pager">
            <span>01</span>
            {homeStories.map((item, index) => (
              <button
                key={item.title}
                className={index === storyIndex ? 'is-active' : ''}
                onClick={() => setStoryIndex(index)}
                aria-label={`Show story ${index + 1}`}
              />
            ))}
            <span>02</span>
          </div>
        </div>
        <button className="reference-audio-control" aria-label="Toggle campaign audio">
          <Volume2 size={14} />
          <span>CAMPAIGN AUDIO</span>
          <span>01:38</span>
        </button>
      </section>
      <section className="reference-whats-new">
        <div className="reference-section-title">
          <span>What's New</span>
          <button aria-label="Open all news">
            <ChevronDown size={14} />
          </button>
        </div>
        <div className="reference-news-grid">
          {homeStories.map((item) => (
            <StoryCard key={item.title} story={item} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Games({ onOpenGame }: { onOpenGame: (id: string) => void }) {
  return (
    <main className="reference-page reference-games-page">
      <section className="reference-games-section">
        <h2>My Games</h2>
        <div className="reference-my-games">
          {games.slice(0, 3).map((game) => (
            <button key={game.id} className="reference-my-game" onClick={() => onOpenGame(game.id)}>
              <div className={`reference-game-image ${game.art}`} />
              <strong>{game.title}</strong>
            </button>
          ))}
        </div>
      </section>
      <section className="reference-all-games">
        <h2>All Games</h2>
        <div className="reference-game-grid">
          {games.map((game) => (
            <button key={game.id} className="reference-large-game" onClick={() => onOpenGame(game.id)}>
              <div className={`reference-game-image ${game.art}`} />
              <div className="reference-large-game-footer">
                <strong>{game.title}</strong>
                <span>{game.status}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function Library({ onOpenGame, extraGames }: { onOpenGame: (id: string) => void; extraGames: StoreGame[] }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'title' | 'status'>('title');

  // Library shows everything owned: the core `games` array plus whatever
  // was added from the Store this session. Store additions don't have a
  // real GameHub page to open (no theme/patch notes/community seeded for
  // them), so they're shown but not clickable — same honesty tradeoff as
  // the rest of the app's session-only features.
  const entries = [
    ...games.map((g) => ({ id: g.id, title: g.title, art: g.art, status: g.status as string, openable: true })),
    ...extraGames.map((g) => ({ id: g.id, title: g.title, art: g.art, status: 'Installed', openable: false })),
  ].sort((a, b) => (sort === 'title' ? a.title.localeCompare(b.title) : a.status.localeCompare(b.status)));

  return (
    <main className="reference-page reference-library-page">
      <header className="reference-library-header">
        <div>
          <div className="reference-kicker">Your collection</div>
          <h1>Library</h1>
          <p>Every world you own, installed or not.</p>
        </div>
        <div className="reference-library-controls">
          <div className="reference-library-sort">
            <button type="button" className={sort === 'title' ? 'is-active' : ''} onClick={() => setSort('title')}>A–Z</button>
            <button type="button" className={sort === 'status' ? 'is-active' : ''} onClick={() => setSort('status')}>Status</button>
          </div>
          <div className="reference-library-view-toggle">
            <button type="button" aria-label="Grid view" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}><Grid2X2 size={14} /></button>
            <button type="button" aria-label="List view" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}><List size={14} /></button>
          </div>
        </div>
      </header>
      {view === 'grid' ? (
        <div className="reference-game-grid reference-library-grid">
          {entries.map((entry) => (
            <button
              key={entry.id}
              className={`reference-large-game ${!entry.openable ? 'is-not-openable' : ''}`}
              onClick={() => entry.openable && onOpenGame(entry.id)}
              disabled={!entry.openable}
            >
              <div className={`reference-game-image ${entry.art}`} />
              <div className="reference-large-game-footer">
                <strong>{entry.title}</strong>
                <span>{entry.status}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="reference-library-list">
          {entries.map((entry) => (
            <button
              key={entry.id}
              className={`reference-library-row ${!entry.openable ? 'is-not-openable' : ''}`}
              onClick={() => entry.openable && onOpenGame(entry.id)}
              disabled={!entry.openable}
            >
              <div className={`reference-library-row-art ${entry.art}`} />
              <span className="reference-library-row-title">{entry.title}</span>
              <span className="reference-library-row-status">{entry.status}</span>
              {entry.openable && <ArrowUpRight size={14} />}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

function Store({ owned, onAddToLibrary }: { owned: StoreGame[]; onAddToLibrary: (game: StoreGame) => void }) {
  return (
    <main className="reference-page reference-store-page">
      <header className="reference-store-header">
        <div className="reference-kicker">Discover</div>
        <h1>Store</h1>
        <p>New worlds from Juhra Studio, ready to add to your library.</p>
      </header>
      <div className="reference-store-grid">
        {storeGames.map((game) => {
          const isOwned = owned.some((g) => g.id === game.id);
          return (
            <div key={game.id} className="reference-store-card">
              <div className={`reference-store-card-art ${game.art}`} />
              <div className="reference-store-card-body">
                <div className="reference-store-card-head">
                  <strong>{game.title}</strong>
                  <span className="reference-store-price">{game.price}</span>
                </div>
                <span className="reference-store-genre">{game.genre}</span>
                <p>{game.tagline}</p>
                <button
                  type="button"
                  className={`reference-store-add ${isOwned ? 'is-owned' : ''}`}
                  disabled={isOwned}
                  onClick={() => onAddToLibrary(game)}
                >
                  {isOwned ? (<><Check size={13} /> In Library</>) : (<><ShoppingBag size={13} /> Add to Library</>)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function PatchNotesContent({ game }: { game: Game }) {
  return (
    <article className="reference-patch-notes">
      <div className={`reference-patch-banner ${game.art}`} />
      <header className="reference-patch-header">
        <div className="reference-kicker">Game updates · {game.title}</div>
        <h1>{game.title.toUpperCase()} PATCH NOTES 1.3.05</h1>
        <p>
          New field events, balance tuning, and quality-of-life changes arrive in the latest update.
          Here is everything changing across the world of {game.title}.
        </p>
        <div className="reference-patch-meta">
          <span>Game Updates</span>
          <strong>Juhra Studio</strong>
          <time>09/01/2026</time>
        </div>
      </header>
      <div className="reference-patch-body">
        <p>
          <strong>TL;DR:</strong> New encounters are live, progression is smoother, and several
          long-standing issues have been resolved across all platforms.
        </p>
        <p>
          We are preparing {game.title} for its next chapter with a focused update built around
          better pacing, clearer feedback, and more ways to stay in the world between missions.
        </p>
        <p>Let’s get into it.</p>
        <hr />
        <h2>All platforms</h2>
        <h3>Gameplay updates</h3>
        <ul>
          <li>Improved encounter pacing during the opening chapters.</li>
          <li>Added clearer audio and visual feedback for new objectives.</li>
          <li>Adjusted reward timing so discoveries feel more immediate.</li>
        </ul>
        <h3>Quality of life</h3>
        <ul>
          <li>Updated the map to make unexplored routes easier to identify.</li>
          <li>Improved controller navigation across the library and game hub.</li>
        </ul>
        <h3>Bug fixes</h3>
        <ul>
          <li>Fixed several cases where story cards could display stale artwork.</li>
          <li>Resolved an issue that could hide patch content after returning to the hub.</li>
        </ul>
      </div>
    </article>
  );
}

function MerchContent({ game }: { game: Game }) {
  const products = [
    { name: `${game.title} // Field Jacket`, detail: 'Limited run outerwear' },
    { name: `${game.title} // Signal Hoodie`, detail: 'Heavyweight fleece' },
    { name: `${game.title} // Archive Tee`, detail: 'Studio edition cotton' },
    { name: `${game.title} // Enamel Pin`, detail: 'Metal collector mark' },
  ];
  return (
    <section className="reference-merch">
      <div className="reference-merch-feature">
        <div className="reference-merch-feature-copy">
          <div className="reference-merch-label">Merch</div>
          <h1>{game.title} Collection</h1>
          <p>Carry a piece of the world beyond the screen with the official {game.title} collection.</p>
          <button className="reference-merch-link" type="button">Explore collection <ArrowUpRight size={13} /></button>
        </div>
        <div className={`reference-merch-feature-art ${game.art}`} />
      </div>
      <div className="reference-merch-grid">
        {products.map((product, index) => (
          <button className="reference-merch-card" key={product.name} type="button">
            <div className={`reference-merch-card-image ${game.art} merch-product-${index + 1}`} />
            <span>Merch</span>
            <strong>{product.name}</strong>
            <small>{product.detail}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function AchievementsContent({ game }: { game: Game }) {
  // Session-only, same as Community — unlocking one here reflects
  // immediately, but resets next launch since there's no backend.
  const [achievements] = useState<Achievement[]>(() => seedAchievements(game));
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const percent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <section className="reference-achievements">
      <header className="reference-achievements-header">
        <div>
          <div className="reference-kicker">Achievements · {game.title}</div>
          <h1>{unlockedCount} of {achievements.length} unlocked</h1>
        </div>
        <div className="reference-achievements-progress">
          <div className="reference-achievements-progress-track">
            <div className="reference-achievements-progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <span>{percent}%</span>
        </div>
      </header>
      <div className="reference-achievements-grid">
        {achievements.map((achievement) => (
          <div key={achievement.id} className={`reference-achievement-card ${achievement.unlocked ? 'is-unlocked' : 'is-locked'}`}>
            <span className="reference-achievement-icon">
              {achievement.unlocked ? <Trophy size={18} /> : <Lock size={16} />}
            </span>
            <div className="reference-achievement-copy">
              <strong>{achievement.title}</strong>
              <p>{achievement.description}</p>
              <div className="reference-achievement-meta">
                {achievement.unlocked ? (
                  <span className="reference-achievement-unlocked-on">Unlocked {achievement.unlockedOn}</span>
                ) : (
                  <span className="reference-achievement-locked-label">Locked</span>
                )}
                <span className="reference-achievement-rarity">{achievement.rarity}% of players</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


// ---------------------------------------------------------------------
// Community tab — Discussions, Suggestions, Reviews, Guides.
//
// This is a full, real, click-through UI: posting, replying, voting,
// rating and publishing all genuinely update what's on screen. But
// there is no backend anywhere in this app, so none of it is saved —
// each section's state is seeded fresh (from the mock data below) every
// time you land on the tab, and lives only in memory for that session.
// If a real API ever exists, each section's local `useState` is the
// only thing that needs to be swapped for a data-fetching hook; the
// UI/interaction layer underneath doesn't need to change.
// ---------------------------------------------------------------------

type Reply = { id: string; author: string; body: string; time: string; upvotes: number };
type Thread = {
  id: string;
  title: string;
  body: string;
  author: string;
  tag: 'General' | 'Help' | 'Fan Content' | 'Bug Reports';
  time: string;
  pinned?: boolean;
  upvotes: number;
  replies: Reply[];
};
type Suggestion = {
  id: string;
  title: string;
  body: string;
  author: string;
  time: string;
  status: 'Under Review' | 'Planned' | 'Shipped';
  votes: number;
  userVote: 1 | -1 | 0;
};
type Review = {
  id: string;
  author: string;
  stars: 1 | 2 | 3 | 4 | 5;
  body: string;
  time: string;
  helpful: number;
  markedHelpful: boolean;
};
type Guide = {
  id: string;
  title: string;
  author: string;
  tag: 'Beginner' | 'Advanced' | 'Walkthrough';
  views: number;
  excerpt: string;
  body: string;
};

let mockIdCounter = 0;
const nextMockId = () => `local-${++mockIdCounter}-${Date.now()}`;

function seedThreads(game: Game): Thread[] {
  return [
    {
      id: nextMockId(),
      title: `Community guidelines for the ${game.title} board`,
      body: `Quick pin before you dive in: keep spoilers tagged, be kind to new players, and route bug reports to the Bug Reports tag so the team can find them. Everything else is fair game — theories, screenshots, hot takes.`,
      author: 'Juhra Team',
      tag: 'General',
      time: '2w ago',
      pinned: true,
      upvotes: 214,
      replies: [
        { id: nextMockId(), author: 'ceed', body: 'Appreciate the clarity, thank you!', time: '2w ago', upvotes: 12 },
      ],
    },
    {
      id: nextMockId(),
      title: `What was your first route through ${game.title}?`,
      body: `Curious how everyone's opening hours went — did you rush the main thread or wander off and get lost in side content first? I spent almost three hours before I even hit the first checkpoint.`,
      author: 'Mara Voss',
      tag: 'Fan Content',
      time: '2h ago',
      upvotes: 41,
      replies: [
        { id: nextMockId(), author: 'Jules Ahn', body: 'Wandered immediately, no regrets.', time: '1h ago', upvotes: 9 },
        { id: nextMockId(), author: 'ceed', body: 'Same, the side stuff is where the good writing is honestly.', time: '48m ago', upvotes: 14 },
      ],
    },
    {
      id: nextMockId(),
      title: 'Share your favorite field note',
      body: `There's a collectible note near the second checkpoint that genuinely got me — no spoilers, but if you know, you know.`,
      author: 'Jules Ahn',
      tag: 'Fan Content',
      time: '5h ago',
      upvotes: 32,
      replies: [],
    },
    {
      id: nextMockId(),
      title: 'Crash on launch after the latest update',
      body: `Getting a crash to desktop a few seconds after the title screen loads, started right after updating. Anyone else? Logs say nothing useful.`,
      author: 'kestrel_dev',
      tag: 'Bug Reports',
      time: '9h ago',
      upvotes: 18,
      replies: [
        { id: nextMockId(), author: 'Juhra Team', body: "We're on it — can you DM us your log file from the Settings > Support tab?", time: '7h ago', upvotes: 6 },
      ],
    },
    {
      id: nextMockId(),
      title: 'Theories for the next chapter',
      body: `Been chewing on the ending for a week. Anyone else think the whole thing is a loop?`,
      author: 'ceed',
      tag: 'General',
      time: '1d ago',
      upvotes: 64,
      replies: [],
    },
  ];
}

function seedSuggestions(game: Game): Suggestion[] {
  return [
    {
      id: nextMockId(),
      title: 'Add a photo mode',
      body: `${game.title} has some gorgeous vistas — a free-camera photo mode with filters would be huge for the fan-content community.`,
      author: 'Mara Voss',
      time: '4d ago',
      status: 'Planned',
      votes: 312,
      userVote: 0,
    },
    {
      id: nextMockId(),
      title: 'Remappable keybinds for left-handed play',
      body: 'Currently a few core actions are hardcoded to keys that overlap with movement for southpaw setups.',
      author: 'kestrel_dev',
      time: '1w ago',
      status: 'Shipped',
      votes: 189,
      userVote: 0,
    },
    {
      id: nextMockId(),
      title: 'Colorblind-friendly UI palette option',
      body: 'A few of the status indicators rely entirely on red/green — an alternate palette would help a lot.',
      author: 'ceed',
      time: '2w ago',
      status: 'Under Review',
      votes: 97,
      userVote: 0,
    },
    {
      id: nextMockId(),
      title: 'New Game+ with carried-over collectibles',
      body: 'Would love a way to replay with everything I found still in my inventory, even just cosmetics.',
      author: 'Jules Ahn',
      time: '3w ago',
      status: 'Under Review',
      votes: 76,
      userVote: 0,
    },
  ];
}

function seedReviews(game: Game): Review[] {
  return [
    { id: nextMockId(), author: 'Mara Voss', stars: 5, body: `Best atmosphere I've felt in ${game.genre.toLowerCase()} in years. Slow in the right places.`, time: '3d ago', helpful: 88, markedHelpful: false },
    { id: nextMockId(), author: 'kestrel_dev', stars: 4, body: 'Excellent, though the back third drags a little compared to the opening.', time: '6d ago', helpful: 41, markedHelpful: false },
    { id: nextMockId(), author: 'ceed', stars: 5, body: 'Replayed it twice already. The sound design alone is worth the price.', time: '1w ago', helpful: 63, markedHelpful: false },
    { id: nextMockId(), author: 'kite_moth', stars: 3, body: 'Great ideas, rough performance on lower-end hardware for me.', time: '2w ago', helpful: 19, markedHelpful: false },
  ];
}

function seedGuides(game: Game): Guide[] {
  return [
    {
      id: nextMockId(),
      title: `A no-spoiler starter's guide to ${game.title}`,
      author: 'Juhra Team',
      tag: 'Beginner',
      views: 18400,
      excerpt: 'Everything you need before your first hour — settings we recommend, and nothing about the story.',
      body: `Before you start: bump the subtitle size up one notch (trust us), and turn on the optional audio cues in Settings > Accessibility. Take your time in the first area — almost nothing there is missable, so there's no reason to rush.`,
    },
    {
      id: nextMockId(),
      title: 'Every collectible location, act by act',
      author: 'kite_moth',
      tag: 'Walkthrough',
      views: 9210,
      excerpt: 'A full act-by-act collectible list with screenshots. Heavy spoilers past the first section.',
      body: `Act One: 4 collectibles, all in the opening corridor loop — easy to grab on a first pass. Act Two onward gets spoilery, so only keep reading if you've cleared it already...`,
    },
    {
      id: nextMockId(),
      title: 'Optimal settings for low-end PCs',
      author: 'kestrel_dev',
      tag: 'Advanced',
      views: 5330,
      excerpt: 'The exact settings combo that got me a stable frame rate on a 6-year-old laptop.',
      body: `Shadow quality is the single biggest cost — dropping it to Medium alone recovered about 30% of my frame rate with barely any visual difference. Pair that with...`,
    },
  ];
}

const communitySortOptions = [
  { id: 'top', label: 'Top', icon: Flame },
  { id: 'new', label: 'New', icon: Clock },
] as const;
type CommunitySort = (typeof communitySortOptions)[number]['id'];

function sortThreads(threads: Thread[], sort: CommunitySort): Thread[] {
  const list = [...threads].sort((a, b) => (sort === 'top' ? b.upvotes - a.upvotes : 0));
  // Pinned always floats to the top regardless of sort.
  list.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  return list;
}

function DiscussionsSection({ game }: { game: Game }) {
  const [threads, setThreads] = useState<Thread[]>(() => seedThreads(game));
  const [sort, setSort] = useState<CommunitySort>('top');
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftTag, setDraftTag] = useState<Thread['tag']>('General');
  const [replyDraft, setReplyDraft] = useState('');

  const openThread = threads.find((t) => t.id === openThreadId) ?? null;
  const sorted = sortThreads(threads, sort);

  const submitThread = () => {
    if (!draftTitle.trim()) return;
    const thread: Thread = {
      id: nextMockId(),
      title: draftTitle.trim(),
      body: draftBody.trim(),
      author: 'You',
      tag: draftTag,
      time: 'just now',
      upvotes: 0,
      replies: [],
    };
    setThreads((current) => [thread, ...current]);
    setDraftTitle('');
    setDraftBody('');
    setComposerOpen(false);
    setOpenThreadId(thread.id);
  };

  const upvoteThread = (id: string) => {
    setThreads((current) => current.map((t) => (t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t)));
  };

  const submitReply = () => {
    if (!replyDraft.trim() || !openThread) return;
    const reply: Reply = { id: nextMockId(), author: 'You', body: replyDraft.trim(), time: 'just now', upvotes: 0 };
    setThreads((current) =>
      current.map((t) => (t.id === openThread.id ? { ...t, replies: [...t.replies, reply] } : t)),
    );
    setReplyDraft('');
  };

  if (openThread) {
    return (
      <div className="reference-community-thread">
        <button type="button" className="reference-community-back" onClick={() => setOpenThreadId(null)}>
          <ChevronLeft size={14} /> All discussions
        </button>
        <div className="reference-community-thread-post">
          <div className="reference-community-thread-post-head">
            {openThread.pinned && <span className="reference-community-pin-badge"><Pin size={11} /> Pinned</span>}
            <span className={`reference-community-tag tag-${openThread.tag.replace(/\s+/g, '-').toLowerCase()}`}>{openThread.tag}</span>
          </div>
          <h1>{openThread.title}</h1>
          <p>{openThread.body}</p>
          <div className="reference-community-thread-meta">
            <RiotAvatar size="small" muted /> <strong>{openThread.author}</strong> <span>· {openThread.time}</span>
            <button type="button" className="reference-community-vote" onClick={() => upvoteThread(openThread.id)}>
              <ArrowBigUp size={15} /> {openThread.upvotes}
            </button>
          </div>
        </div>
        <div className="reference-community-replies">
          <div className="reference-community-section-title">
            <span>{openThread.replies.length} {openThread.replies.length === 1 ? 'reply' : 'replies'}</span>
          </div>
          {openThread.replies.map((reply) => (
            <div className="reference-community-reply" key={reply.id}>
              <CornerDownRight size={13} className="reference-community-reply-arrow" />
              <div>
                <div className="reference-community-thread-meta">
                  <strong>{reply.author}</strong> <span>· {reply.time}</span>
                </div>
                <p>{reply.body}</p>
              </div>
            </div>
          ))}
          <div className="reference-community-composer">
            <textarea
              placeholder={`Reply to "${openThread.title}"…`}
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              rows={3}
            />
            <button type="button" onClick={submitReply} disabled={!replyDraft.trim()}>
              <Send size={13} /> Reply
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reference-community-discussions">
      <div className="reference-community-toolbar">
        <div className="reference-community-sort">
          {communitySortOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={sort === option.id ? 'is-active' : ''}
              onClick={() => setSort(option.id)}
            >
              <option.icon size={13} /> {option.label}
            </button>
          ))}
        </div>
        <button type="button" className="reference-community-start" onClick={() => setComposerOpen((v) => !v)}>
          <Plus size={14} /> Start a discussion
        </button>
      </div>
      {composerOpen && (
        <div className="reference-community-composer reference-community-composer-thread">
          <input
            type="text"
            placeholder="Discussion title"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            maxLength={120}
          />
          <textarea
            placeholder="What's on your mind?"
            value={draftBody}
            onChange={(event) => setDraftBody(event.target.value)}
            rows={3}
          />
          <div className="reference-community-composer-row">
            <div className="reference-community-tag-picker">
              {(['General', 'Help', 'Fan Content', 'Bug Reports'] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={draftTag === tag ? 'is-active' : ''}
                  onClick={() => setDraftTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button type="button" onClick={submitThread} disabled={!draftTitle.trim()}>
              <Send size={13} /> Post
            </button>
          </div>
        </div>
      )}
      {sorted.map((thread) => (
        <button className="reference-discussion-row" key={thread.id} type="button" onClick={() => setOpenThreadId(thread.id)}>
          <span className="reference-discussion-icon">{thread.pinned ? <Pin size={14} /> : <MessageCircle size={15} />}</span>
          <span className="reference-discussion-copy">
            <strong>{thread.title}</strong>
            <small>
              <span className={`reference-community-tag tag-${thread.tag.replace(/\s+/g, '-').toLowerCase()}`}>{thread.tag}</span>
              {thread.author} · {thread.time}
            </small>
          </span>
          <span className="reference-discussion-replies">{thread.replies.length}</span>
        </button>
      ))}
    </div>
  );
}

function SuggestionsSection({ game }: { game: Game }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => seedSuggestions(game));
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');

  const vote = (id: string, direction: 1 | -1) => {
    setSuggestions((current) =>
      current.map((s) => {
        if (s.id !== id) return s;
        const nextVote = s.userVote === direction ? 0 : direction;
        const delta = nextVote - s.userVote;
        return { ...s, votes: s.votes + delta, userVote: nextVote };
      }),
    );
  };

  const submit = () => {
    if (!draftTitle.trim()) return;
    const suggestion: Suggestion = {
      id: nextMockId(),
      title: draftTitle.trim(),
      body: draftBody.trim(),
      author: 'You',
      time: 'just now',
      status: 'Under Review',
      votes: 1,
      userVote: 1,
    };
    setSuggestions((current) => [suggestion, ...current].sort((a, b) => b.votes - a.votes));
    setDraftTitle('');
    setDraftBody('');
    setComposerOpen(false);
  };

  const sorted = [...suggestions].sort((a, b) => b.votes - a.votes);

  return (
    <div className="reference-community-suggestions">
      <div className="reference-community-toolbar">
        <p className="reference-community-hint"><Lightbulb size={13} /> Vote up what you want to see next — the team reads these.</p>
        <button type="button" className="reference-community-start" onClick={() => setComposerOpen((v) => !v)}>
          <Plus size={14} /> Suggest something
        </button>
      </div>
      {composerOpen && (
        <div className="reference-community-composer reference-community-composer-thread">
          <input
            type="text"
            placeholder="Suggestion title"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            maxLength={100}
          />
          <textarea
            placeholder="What would this add, and why does it matter?"
            value={draftBody}
            onChange={(event) => setDraftBody(event.target.value)}
            rows={3}
          />
          <div className="reference-community-composer-row reference-community-composer-row-end">
            <button type="button" onClick={submit} disabled={!draftTitle.trim()}>
              <Send size={13} /> Submit
            </button>
          </div>
        </div>
      )}
      {sorted.map((suggestion) => (
        <div className="reference-suggestion-row" key={suggestion.id}>
          <div className="reference-suggestion-votes">
            <button
              type="button"
              className={suggestion.userVote === 1 ? 'is-active' : ''}
              onClick={() => vote(suggestion.id, 1)}
              aria-label="Upvote"
            >
              <ArrowBigUp size={18} />
            </button>
            <strong>{suggestion.votes}</strong>
            <button
              type="button"
              className={suggestion.userVote === -1 ? 'is-active' : ''}
              onClick={() => vote(suggestion.id, -1)}
              aria-label="Downvote"
            >
              <ArrowBigDown size={18} />
            </button>
          </div>
          <div className="reference-suggestion-copy">
            <div className="reference-suggestion-head">
              <strong>{suggestion.title}</strong>
              <span className={`reference-suggestion-status status-${suggestion.status.replace(/\s+/g, '-').toLowerCase()}`}>
                {suggestion.status === 'Shipped' && <CheckCircle2 size={11} />}
                {suggestion.status}
              </span>
            </div>
            <p>{suggestion.body}</p>
            <small>{suggestion.author} · {suggestion.time}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="reference-star-row" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= value ? 'currentColor' : 'none'} className={n <= value ? 'is-filled' : ''} />
      ))}
    </span>
  );
}

function ReviewsSection({ game }: { game: Game }) {
  const [reviews, setReviews] = useState<Review[]>(() => seedReviews(game));
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftStars, setDraftStars] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [draftBody, setDraftBody] = useState('');

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length : 0;
  const histogram = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.stars === star).length,
  }));
  const maxCount = Math.max(1, ...histogram.map((h) => h.count));

  const markHelpful = (id: string) => {
    setReviews((current) =>
      current.map((r) =>
        r.id === id ? { ...r, markedHelpful: !r.markedHelpful, helpful: r.helpful + (r.markedHelpful ? -1 : 1) } : r,
      ),
    );
  };

  const submit = () => {
    if (!draftBody.trim()) return;
    const review: Review = {
      id: nextMockId(),
      author: 'You',
      stars: draftStars,
      body: draftBody.trim(),
      time: 'just now',
      helpful: 0,
      markedHelpful: false,
    };
    setReviews((current) => [review, ...current]);
    setDraftBody('');
    setComposerOpen(false);
  };

  return (
    <div className="reference-community-reviews">
      <div className="reference-reviews-summary">
        <div className="reference-reviews-average">
          <strong>{average.toFixed(1)}</strong>
          <StarRow value={Math.round(average)} size={16} />
          <span>{reviews.length} reviews</span>
        </div>
        <div className="reference-reviews-histogram">
          {histogram.map((row) => (
            <div className="reference-reviews-histogram-row" key={row.star}>
              <span>{row.star}★</span>
              <div className="reference-reviews-histogram-track">
                <div className="reference-reviews-histogram-fill" style={{ width: `${(row.count / maxCount) * 100}%` }} />
              </div>
              <span>{row.count}</span>
            </div>
          ))}
        </div>
        <button type="button" className="reference-community-start" onClick={() => setComposerOpen((v) => !v)}>
          <Star size={14} /> Write a review
        </button>
      </div>
      {composerOpen && (
        <div className="reference-community-composer reference-community-composer-thread">
          <div className="reference-star-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} stars`}
                className={n <= draftStars ? 'is-filled' : ''}
                onClick={() => setDraftStars(n as 1 | 2 | 3 | 4 | 5)}
              >
                <Star size={22} fill={n <= draftStars ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <textarea
            placeholder={`What did you think of ${game.title}?`}
            value={draftBody}
            onChange={(event) => setDraftBody(event.target.value)}
            rows={3}
          />
          <div className="reference-community-composer-row reference-community-composer-row-end">
            <button type="button" onClick={submit} disabled={!draftBody.trim()}>
              <Send size={13} /> Publish review
            </button>
          </div>
        </div>
      )}
      <div className="reference-reviews-list">
        {reviews.map((review) => (
          <div className="reference-review-row" key={review.id}>
            <div className="reference-community-thread-meta">
              <RiotAvatar size="small" muted /> <strong>{review.author}</strong> <span>· {review.time}</span>
            </div>
            <StarRow value={review.stars} />
            <p>{review.body}</p>
            <button
              type="button"
              className={`reference-review-helpful ${review.markedHelpful ? 'is-active' : ''}`}
              onClick={() => markHelpful(review.id)}
            >
              <ThumbsUp size={12} /> Helpful ({review.helpful})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuidesSection({ game }: { game: Game }) {
  const [guides, setGuides] = useState<Guide[]>(() => seedGuides(game));
  const [openGuideId, setOpenGuideId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftTag, setDraftTag] = useState<Guide['tag']>('Beginner');

  const openGuide = guides.find((g) => g.id === openGuideId) ?? null;

  const submit = () => {
    if (!draftTitle.trim() || !draftBody.trim()) return;
    const guide: Guide = {
      id: nextMockId(),
      title: draftTitle.trim(),
      author: 'You',
      tag: draftTag,
      views: 0,
      excerpt: draftBody.trim().slice(0, 120) + (draftBody.trim().length > 120 ? '…' : ''),
      body: draftBody.trim(),
    };
    setGuides((current) => [guide, ...current]);
    setDraftTitle('');
    setDraftBody('');
    setComposerOpen(false);
  };

  if (openGuide) {
    return (
      <div className="reference-community-thread">
        <button type="button" className="reference-community-back" onClick={() => setOpenGuideId(null)}>
          <ChevronLeft size={14} /> All guides
        </button>
        <div className="reference-community-thread-post">
          <div className="reference-community-thread-post-head">
            <span className={`reference-community-tag tag-${openGuide.tag.toLowerCase()}`}>{openGuide.tag}</span>
          </div>
          <h1>{openGuide.title}</h1>
          <p>{openGuide.body}</p>
          <div className="reference-community-thread-meta">
            <RiotAvatar size="small" muted /> <strong>{openGuide.author}</strong>
            <span className="reference-guide-views"><Eye size={12} /> {openGuide.views.toLocaleString()} views</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reference-community-guides">
      <div className="reference-community-toolbar">
        <p className="reference-community-hint"><BookOpen size={13} /> Written by players, for players.</p>
        <button type="button" className="reference-community-start" onClick={() => setComposerOpen((v) => !v)}>
          <Plus size={14} /> Write a guide
        </button>
      </div>
      {composerOpen && (
        <div className="reference-community-composer reference-community-composer-thread">
          <input
            type="text"
            placeholder="Guide title"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            maxLength={120}
          />
          <textarea
            placeholder="Share what you know…"
            value={draftBody}
            onChange={(event) => setDraftBody(event.target.value)}
            rows={4}
          />
          <div className="reference-community-composer-row">
            <div className="reference-community-tag-picker">
              {(['Beginner', 'Advanced', 'Walkthrough'] as const).map((tag) => (
                <button key={tag} type="button" className={draftTag === tag ? 'is-active' : ''} onClick={() => setDraftTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
            <button type="button" onClick={submit} disabled={!draftTitle.trim() || !draftBody.trim()}>
              <Send size={13} /> Publish
            </button>
          </div>
        </div>
      )}
      <div className="reference-guides-grid">
        {guides.map((guide) => (
          <button className="reference-guide-card" key={guide.id} type="button" onClick={() => setOpenGuideId(guide.id)}>
            <span className={`reference-community-tag tag-${guide.tag.toLowerCase()}`}>{guide.tag}</span>
            <strong>{guide.title}</strong>
            <p>{guide.excerpt}</p>
            <small>{guide.author} · <Eye size={11} /> {guide.views.toLocaleString()}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

const communitySections = [
  { id: 'discussions', label: 'Discussions', icon: MessageCircle },
  { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'guides', label: 'Guides', icon: BookOpen },
] as const;
type CommunitySectionId = (typeof communitySections)[number]['id'];

function CommunityContent({ game }: { game: Game }) {
  const [section, setSection] = useState<CommunitySectionId>('discussions');

  return (
    <section className="reference-community">
      <header className="reference-community-header">
        <div>
          <div className="reference-kicker">Community · {game.title}</div>
          <h1>{game.title} Community</h1>
          <p>Discussions, suggestions, reviews, and player-written guides — all in one place.</p>
        </div>
        <aside className="reference-community-sidebar reference-community-sidebar-compact">
          <div><UsersRound size={13} /> 12.4k members</div>
          <div><Circle size={7} fill="currentColor" className="reference-community-online-dot" /> 812 online</div>
        </aside>
      </header>
      <nav className="reference-community-subnav">
        {communitySections.map((item) => (
          <button
            key={item.id}
            type="button"
            className={section === item.id ? 'is-active' : ''}
            onClick={() => setSection(item.id)}
          >
            <item.icon size={14} /> {item.label}
          </button>
        ))}
      </nav>
      <div className="reference-community-layout reference-community-layout-single">
        {/* All four stay mounted (just hidden) rather than conditionally
            rendered, so switching sub-tabs never discards a draft post,
            a vote, or a newly published guide/review from earlier in
            the session — only leaving the Community tab entirely does. */}
        <div style={{ display: section === 'discussions' ? undefined : 'none' }}>
          <DiscussionsSection game={game} />
        </div>
        <div style={{ display: section === 'suggestions' ? undefined : 'none' }}>
          <SuggestionsSection game={game} />
        </div>
        <div style={{ display: section === 'reviews' ? undefined : 'none' }}>
          <ReviewsSection game={game} />
        </div>
        <div style={{ display: section === 'guides' ? undefined : 'none' }}>
          <GuidesSection game={game} />
        </div>
      </div>
    </section>
  );
}

function GameHub({ game }: { game: Game }) {
  const [tab, setTab] = useState('Overview');
  const tabs = ['Overview', 'Patch Notes', 'Merch', 'Community', 'Achievements'];
  const isPatchNotes = tab === 'Patch Notes';
  const isMerch = tab === 'Merch';
  const isCommunity = tab === 'Community';
  const isAchievements = tab === 'Achievements';
  const isSecondaryTab = isPatchNotes || isMerch || isCommunity || isAchievements;
  return (
    <main className={`reference-page reference-hub-page reference-game-${game.id} ${game.art} ${isSecondaryTab ? 'is-secondary-tab' : ''} ${isPatchNotes ? 'is-patch-notes' : ''} ${isMerch ? 'is-merch' : ''} ${isCommunity ? 'is-community' : ''} ${isAchievements ? 'is-achievements' : ''}`}>
      <div className="reference-hub-overlay" />
      <nav className="reference-hub-tabs">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            className={tab === item ? 'is-active' : ''}
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
          >
            {tab === item && <motion.span layoutId="hub-tab-active" className="reference-hub-tab-indicator" transition={{ type: 'spring', stiffness: 360, damping: 28 }} />}
            <span className="reference-tab-label">{item}</span>
          </button>
        ))}
      </nav>
      {isSecondaryTab ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            className="reference-hub-tab-panel"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: .22, ease: [.22, .8, .25, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            {isPatchNotes ? (
              <PatchNotesContent game={game} />
            ) : isMerch ? (
              <MerchContent game={game} />
            ) : isCommunity ? (
              <CommunityContent game={game} />
            ) : (
              <AchievementsContent game={game} />
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              className="reference-hub-copy"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: .22, ease: [.22, .8, .25, 1] }}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="reference-kicker">{tab} · {game.genre}</div>
              <h1>{game.title}</h1>
              <p>{game.subtitle} A new Juhra world shaped by memory, weather, and the decisions left behind.</p>
            </motion.div>
          </AnimatePresence>
          <div className="reference-hub-play-area">
            <PrimaryButton icon="play" className="reference-hub-playing-button">
              {game.status === 'Installed' ? 'Playing' : 'Install'}
            </PrimaryButton>
            <span className="reference-hub-status-line">
              <span aria-hidden="true">◆</span> 3 Status Updates
            </span>
          </div>
          <div className="reference-hub-news">
            {(overviewCards[game.id] ?? []).map((card, index) => (
              <button key={card.title} className={`reference-hub-news-card reference-hub-news-card-${index + 1}`} type="button">
                <div className={`reference-news-thumb ${game.art} reference-news-thumb-${index + 1}`}>
                  {card.kind === 'video' ? (
                    <span className="reference-news-video-meta">
                      <span className="reference-news-play"><Play size={9} fill="currentColor" strokeWidth={1.8} /></span>
                      <span className="reference-news-duration">{card.duration}</span>
                    </span>
                  ) : (
                    <span className="reference-news-badge">MERCH</span>
                  )}
                </div>
                <span className="reference-news-label">{card.label}</span>
                <strong>{card.title}</strong>
              </button>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function PartyCard({ activeGame }: { activeGame: Game }) {
  return (
    <div className="reference-riot-party">
      <div className="reference-riot-party-title">
        <UsersRound size={12} />
        <strong>Party 5/5</strong>
      </div>
      <div className="reference-riot-party-player">
        <span className="reference-friend-avatar is-red"><UserRound size={17} /></span>
        <span>
          <strong>ceed</strong>
          <small><Gamepad2 size={10} /> Competitive 6 - 9 · {activeGame.title}</small>
        </span>
      </div>
      <span className="reference-riot-party-more">+4 Others</span>
    </div>
  );
}

function SocialTabs({ tab, onChange }: { tab: SocialTab; onChange: (tab: SocialTab) => void }) {
  return (
    <nav className="reference-social-tabs" aria-label="Social views">
      <button className={tab === 'friends' ? 'is-active' : ''} onClick={() => onChange('friends')} aria-label="Friends list">
        <List size={15} />
        {tab === 'friends' && <motion.span layoutId="reference-social-tab-active" className="reference-social-tab-active" transition={{ type: 'spring', stiffness: 520, damping: 34 }} />}
      </button>
      <button className={tab === 'chat' ? 'is-active' : ''} onClick={() => onChange('chat')} aria-label="Messages">
        <MessageCircle size={15} />
        {tab === 'chat' && <motion.span layoutId="reference-social-tab-active" className="reference-social-tab-active" transition={{ type: 'spring', stiffness: 520, damping: 34 }} />}
      </button>
      <button className={tab === 'add' ? 'is-active' : ''} onClick={() => onChange('add')} aria-label="Add friend">
        <UserPlus size={15} />
        {tab === 'add' && <motion.span layoutId="reference-social-tab-active" className="reference-social-tab-active" transition={{ type: 'spring', stiffness: 520, damping: 34 }} />}
      </button>
    </nav>
  );
}

function FriendsView({ activeGame }: { activeGame: Game }) {
  const friends = [
    { name: 'Mara Voss', status: `Playing ${activeGame.title}`, online: true },
    { name: 'Jules Ahn', status: 'Exploring Blue Echo', online: true },
    { name: 'Matvly Navi24324', status: 'Offline', online: false },
    { name: 'TrixSoul', status: 'Offline', online: false },
  ];
  return (
    <div className="reference-social-view">
      <label className="reference-friends-search">
        <Search size={14} />
        <input placeholder="Search" aria-label="Search friends" />
      </label>
      <div className="reference-game-heading">
        <span className={`reference-game-mark reference-game-mark-${activeGame.id}`}>{activeGame.glyph}</span>
        <strong>{activeGame.title.toUpperCase()} 1</strong>
      </div>
      <PartyCard activeGame={activeGame} />
      <div className="reference-online-heading">Online 2</div>
      <div className="reference-friend-list">
        {friends.filter((friend) => friend.online).map((friend) => (
          <button key={friend.name} className="reference-friend-row">
            <RiotAvatar />
            <span>
              <strong>{friend.name}</strong>
              <small><Gamepad2 size={9} /> {friend.status}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="reference-offline-heading">Offline 2</div>
      <div className="reference-friend-list">
        {friends.filter((friend) => !friend.online).map((friend) => (
          <button key={friend.name} className="reference-friend-row">
            <RiotAvatar muted />
            <span>
              <strong>{friend.name}</strong>
              <small>{friend.status}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function InGameView({ activeGame, onClose }: { activeGame: Game; onClose: () => void }) {
  return (
    <div className="reference-ingame-view">
      <div className="reference-ingame-header">
        <strong>In Game</strong>
        <button onClick={onClose} aria-label="Close in-game panel"><X size={14} /></button>
      </div>
      <PartyCard activeGame={activeGame} />
    </div>
  );
}

function ChatView() {
  return (
    <div className="reference-social-view reference-chat-view">
      <button className="reference-chat-row">
        <span className="reference-friend-avatar is-red"><UserRound size={17} /></span>
        <span>
          <strong>ceed</strong>
          <small>how u doin today bro</small>
        </span>
        <time>4d ago</time>
      </button>
    </div>
  );
}

function AddFriendView() {
  return (
    <div className="reference-social-view reference-add-view">
      <div className="reference-add-fields">
        <label><UserPlus size={13} /><input placeholder="Game name" aria-label="Game name" /></label>
        <label><span>#</span><input placeholder="Tagline" aria-label="Tagline" /></label>
      </div>
      <button className="reference-add-button">Add Friend</button>
      <div className="reference-empty-state">
        <UserPlus size={43} strokeWidth={1.7} />
        <strong>All clear for now</strong>
        <span>No friend requests.</span>
      </div>
    </div>
  );
}

function FriendsPanel({ mode, activeGame, tab, onTabChange, onClose }: { mode: SocialMode; activeGame: Game; tab: SocialTab; onTabChange: (tab: SocialTab) => void; onClose: () => void }) {
  return (
    <motion.aside
      initial={{ opacity: 0, scaleX: .42, scaleY: .08 }}
      animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleX: .42, scaleY: .08 }}
      transition={{ duration: .24, ease: [.16, .84, .32, 1] }}
      style={{ transformOrigin: 'top right', willChange: 'transform, opacity' }}
      className={`reference-social-panel ${mode === 'in-game' ? 'is-ingame' : ''}`}
    >
      <div className={`reference-social-panel-surface ${mode === 'in-game' ? 'is-ingame' : ''}`}>
        {mode === 'in-game' ? (
          <InGameView activeGame={activeGame} onClose={onClose} />
        ) : (
          <>
            <div className="reference-social-profile">
              <RiotAvatar size="small" />
              <span>
                <strong>190cm 87kg 20cm</strong>
                <small>Online</small>
              </span>
              <button onClick={onClose} aria-label="Close social panel"><ChevronLeft size={15} /></button>
            </div>
            <SocialTabs tab={tab} onChange={onTabChange} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                className="reference-social-tab-content"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: .2, ease: 'easeOut' }}
              >
                {tab === 'friends' && <FriendsView activeGame={activeGame} />}
                {tab === 'chat' && <ChatView />}
                {tab === 'add' && <AddFriendView />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.aside>
  );
}

function AccountMenu({ onClose, onNavigate, onSignOut }: { onClose: () => void; onNavigate: (path: string) => void; onSignOut: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="reference-account-menu"
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="reference-account-menu-surface">
        <div className="reference-account-menu-profile">
          <RiotAvatar size="large" />
          <span><strong>190cm 87kg 20cm<span className="reference-name-tag">#King</span></strong><small>Online</small></span>
        </div>
        {[
          ['Account Details', '/profile'],
          ['Account Security', '/settings'],
          ['Settings', '/settings'],
          ["What's New", '/'],
        ].map(([label, path]) => (
          <button key={label} onClick={() => { onNavigate(path); onClose(); }}>
            {label}
            <ArrowUpRight size={13} />
          </button>
        ))}
        <button className="reference-account-danger" onClick={onSignOut}>Sign Out</button>
        <button className="reference-account-exit" onClick={onClose}>Exit</button>
      </div>
    </motion.div>
  );
}

function GameMenu({ activeGame, onClose, onNavigate }: { activeGame: Game | null; onClose: () => void; onNavigate: (path: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="reference-account-menu reference-game-menu"
      role="menu"
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="reference-account-menu-surface">
        <div className="reference-account-menu-profile reference-game-menu-heading">
          <span className="reference-game-menu-icon"><Gamepad2 size={18} /></span>
          <span>
            <strong>Game library</strong>
            <small>{activeGame ? `Playing ${activeGame.title}` : 'Choose a world'}</small>
          </span>
        </div>
        <div className="reference-game-menu-list">
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              role="menuitem"
              className={`reference-game-menu-item ${activeGame?.id === game.id ? 'is-active' : ''}`}
              onClick={() => {
                onNavigate(`/games/${game.id}`);
                onClose();
              }}
            >
              <span className={`reference-game-mark reference-game-mark-${game.id}`}>{game.glyph}</span>
              <span>
                <strong>{game.title}</strong>
                <small>{game.status}</small>
              </span>
              {activeGame?.id === game.id && <span className="reference-game-menu-current">CURRENT</span>}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="reference-game-menu-all"
          onClick={() => {
            onNavigate('/games');
            onClose();
          }}
        >
          Browse all games
          <ArrowUpRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}

const notificationIcons: Record<NotificationKind, typeof Bell> = {
  friend: UsersRound,
  achievement: Trophy,
  patch: Sparkles,
  system: Bell,
};

function NotificationsMenu({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="reference-account-menu reference-notif-menu"
      role="menu"
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="reference-account-menu-surface reference-notif-menu-surface">
        <div className="reference-account-menu-profile reference-game-menu-heading">
          <span className="reference-game-menu-icon"><Bell size={16} /></span>
          <span>
            <strong>Notifications</strong>
            <small>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</small>
          </span>
          {unreadCount > 0 && (
            <button type="button" className="reference-notif-mark-all" onClick={onMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>
        <div className="reference-notif-list">
          {notifications.length === 0 ? (
            <div className="reference-notif-empty">Nothing here yet.</div>
          ) : (
            notifications.map((notif) => {
              const Icon = notificationIcons[notif.kind];
              return (
                <button
                  key={notif.id}
                  type="button"
                  role="menuitem"
                  className={`reference-notif-item ${notif.read ? '' : 'is-unread'}`}
                  onClick={() => onMarkRead(notif.id)}
                >
                  <span className={`reference-notif-icon reference-notif-icon-${notif.kind}`}><Icon size={14} /></span>
                  <span className="reference-notif-copy">
                    <strong>{notif.title}</strong>
                    <small>{notif.body}</small>
                    <span className="reference-notif-time">{notif.time}</span>
                  </span>
                  {!notif.read && <span className="reference-notif-dot" aria-hidden="true" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SettingsToggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="reference-settings-row">
      <div className="reference-settings-row-copy">
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`reference-settings-toggle ${checked ? 'is-on' : ''}`}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}

function SettingsModal({ onClose, activeGame }: { onClose: () => void; activeGame: Game | null }) {
  const [section, setSection] = useState('client-general');
  const [openOnStartup, setOpenOnStartup] = useState(true);
  const [minimizeOnClose, setMinimizeOnClose] = useState(true);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [gameAudio, setGameAudio] = useState(true);
  const [notifDesktop, setNotifDesktop] = useState(true);
  const [notifFriendActivity, setNotifFriendActivity] = useState(true);
  const [notifAchievements, setNotifAchievements] = useState(true);
  const [notifPatchNotes, setNotifPatchNotes] = useState(false);
  const [showOnline, setShowOnline] = useState(true);
  const [partyInvites, setPartyInvites] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'latest' | 'available' | 'error'>('idle');
  const [updateInfo, setUpdateInfo] = useState<{ version: string; url: string } | null>(null);
  const selectedGame = games.find((game) => section === `game-${game.id}`);
  const contextGame = selectedGame ?? activeGame;
  const sectionLabel = section === 'client-notifications'
    ? 'Notifications'
    : section === 'client-social'
      ? 'Social'
      : 'General';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="reference-settings-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        className={`reference-settings-modal ${contextGame ? `has-game-context reference-game-context reference-game-${contextGame.id}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reference-settings-title"
        initial={{ opacity: 0, y: 18, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: .98 }}
        transition={{ duration: .2, ease: 'easeOut' }}
        style={{ willChange: 'transform, opacity' }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="reference-settings-modal-surface">
        <header className="reference-settings-header">
          <h2 id="reference-settings-title">Settings</h2>
          <button type="button" onClick={onClose} aria-label="Close settings"><X size={16} /></button>
        </header>
        <div className="reference-settings-body">
          <aside className="reference-settings-sidebar">
            <div className="reference-settings-group-label">Juhra Client</div>
            {[
              ['client-general', 'General', Settings],
              ['client-notifications', 'Notifications', Bell],
              ['client-social', 'Social', Users],
            ].map(([id, label, Icon]) => {
              const ItemIcon = Icon as typeof Settings;
              return (
                <button
                  type="button"
                  key={id as string}
                  className={`reference-settings-item ${section === id ? 'is-active' : ''}`}
                  onClick={() => setSection(id as string)}
                >
                  <ItemIcon size={14} />
                  <span>{label as string}</span>
                </button>
              );
            })}
            <div className="reference-settings-divider" />
            <div className="reference-settings-group-label">World settings</div>
            {games.map((game) => (
              <button
                type="button"
                key={game.id}
                className={`reference-settings-item reference-settings-game-item reference-settings-game-${game.id} ${selectedGame?.id === game.id ? 'is-active' : ''}`}
                onClick={() => setSection(`game-${game.id}`)}
              >
                <span className="reference-settings-game-glyph">{game.glyph}</span>
                <span>{game.title}</span>
              </button>
            ))}
            <div className="reference-settings-sidebar-footer">
              <span>JUHRA CLIENT</span>
              <small>v1.0.0 · THE FIELD REMEMBERS</small>
            </div>
          </aside>
          <main className="reference-settings-main">
            <div className="reference-settings-main-heading">
              <div>
                <span className="reference-settings-eyebrow">
                  {selectedGame ? `${selectedGame.title} settings` : `Juhra Client · ${sectionLabel}`}
                </span>
                <h3>{selectedGame ? `${selectedGame.title} - General` : `Juhra Client - ${sectionLabel}`}</h3>
              </div>
              <span className="reference-settings-version">SETTINGS</span>
            </div>
            {selectedGame ? (
              <div className="reference-settings-content">
                <div className="reference-settings-intro">
                  <span className={`reference-settings-game-badge reference-settings-game-badge-${selectedGame.id}`}>{selectedGame.glyph}</span>
                  <div>
                    <strong>{selectedGame.title}</strong>
                    <p>Manage how this world launches and sounds when you return to it.</p>
                  </div>
                </div>
                <SettingsToggle
                  label={`Launch ${selectedGame.title} with Juhra`}
                  detail="Keep this world ready from the launcher."
                  checked={openOnStartup}
                  onChange={() => setOpenOnStartup((value) => !value)}
                />
                <SettingsToggle
                  label="Enable game audio"
                  detail="Play environmental audio and transmission cues."
                  checked={gameAudio}
                  onChange={() => setGameAudio((value) => !value)}
                />
                <SettingsToggle
                  label="Use hardware acceleration"
                  detail="Use your graphics card to keep this world running smoothly."
                  checked={hardwareAcceleration}
                  onChange={() => setHardwareAcceleration((value) => !value)}
                />
              </div>
            ) : section === 'client-notifications' ? (
              <div className="reference-settings-content">
                <SettingsToggle
                  label="Desktop notifications"
                  detail="Show updates when a new transmission or friend activity arrives."
                  checked={notifDesktop}
                  onChange={() => setNotifDesktop((value) => !value)}
                />
                <SettingsToggle
                  label="Friend activity"
                  detail="Notify me when friends enter a world."
                  checked={notifFriendActivity}
                  onChange={() => setNotifFriendActivity((value) => !value)}
                />
                <SettingsToggle
                  label="Achievement unlocks"
                  detail="Notify me when I unlock an achievement."
                  checked={notifAchievements}
                  onChange={() => setNotifAchievements((value) => !value)}
                />
                <SettingsToggle
                  label="Patch notes"
                  detail="Notify me when a game I own gets an update."
                  checked={notifPatchNotes}
                  onChange={() => setNotifPatchNotes((value) => !value)}
                />
              </div>
            ) : section === 'client-social' ? (
              <div className="reference-settings-content">
                <SettingsToggle
                  label="Show me as online"
                  detail="Let friends see when you are exploring Juhra."
                  checked={showOnline}
                  onChange={() => setShowOnline((value) => !value)}
                />
                <SettingsToggle
                  label="Allow party invitations"
                  detail="Friends can invite you to explore a world together."
                  checked={partyInvites}
                  onChange={() => setPartyInvites((value) => !value)}
                />
              </div>
            ) : (
              <div className="reference-settings-content">
                <label className="reference-settings-select-row">
                  <span>
                    <strong>Juhra client language</strong>
                    <small>Choose the language used throughout the launcher.</small>
                  </span>
                  <select defaultValue="English (US)" aria-label="Juhra client language">
                    <option>English (US)</option>
                    <option>Français</option>
                    <option>العربية</option>
                  </select>
                </label>
                <SettingsToggle
                  label="Open Juhra on startup"
                  detail="Start the launcher when your computer starts."
                  checked={openOnStartup}
                  onChange={() => setOpenOnStartup((value) => !value)}
                />
                <SettingsToggle
                  label="Minimize to system tray"
                  detail="Keep Juhra running so your worlds open faster."
                  checked={minimizeOnClose}
                  onChange={() => setMinimizeOnClose((value) => !value)}
                />
                <SettingsToggle
                  label="Use hardware acceleration"
                  detail="Use your graphics card to make Juhra run smoother."
                  checked={hardwareAcceleration}
                  onChange={() => setHardwareAcceleration((value) => !value)}
                />
                <div className="reference-settings-update-row">
                  <div className="reference-settings-row-copy">
                    <strong>Juhra Client</strong>
                    <span>
                      {updateStatus === 'checking' && 'Checking for updates…'}
                      {updateStatus === 'idle' && 'Check whether a newer version is available.'}
                      {updateStatus === 'latest' && "You're on the latest version."}
                      {updateStatus === 'available' && updateInfo && `Version ${updateInfo.version} is available.`}
                      {updateStatus === 'error' && "Couldn't check for updates — try again later."}
                    </span>
                  </div>
                  {updateStatus === 'available' && updateInfo ? (
                    <button
                      type="button"
                      className="reference-settings-update-button is-available"
                      onClick={async () => {
                        try {
                          const { openUrl } = await import('@tauri-apps/plugin-opener');
                          await openUrl(updateInfo.url);
                        } catch {
                          window.open(updateInfo.url, '_blank');
                        }
                      }}
                    >
                      <Download size={13} /> Download
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="reference-settings-update-button"
                      disabled={updateStatus === 'checking'}
                      onClick={async () => {
                        setUpdateStatus('checking');
                        try {
                          if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) {
                            // No Tauri backend to check against (e.g. plain browser dev preview).
                            setUpdateStatus('latest');
                            return;
                          }
                          const { invoke } = await import('@tauri-apps/api/core');
                          const result = await invoke<{ available: boolean; latestVersion: string; url: string }>('check_for_updates');
                          if (result.available) {
                            setUpdateInfo({ version: result.latestVersion, url: result.url });
                            setUpdateStatus('available');
                          } else {
                            setUpdateStatus('latest');
                          }
                        } catch {
                          setUpdateStatus('error');
                        }
                      }}
                    >
                      <RefreshCw size={13} /> Check for Updates
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

function MobileRail({ path }: { path: string }) {
  return (
    <nav className="reference-mobile-rail">
      {[
        ['/', HomeIcon, 'Home'],
        ['/games', Grid2X2, 'Games'],
        ['/library', Gamepad2, 'Library'],
        ['/store', Grid2X2, 'Store'],
        ['/news', Bell, 'News'],
      ].map(([href, Icon, label]) => {
        const NavIcon = Icon as typeof HomeIcon;
        return (
          <Link key={href as string} href={href as string} className={path === href ? 'is-active' : ''}>
            <NavIcon size={16} />
            <span>{label as string}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Client() {
  const [path, setPath] = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [socialMode, setSocialMode] = useState<SocialMode>('friends');
  const [socialTab, setSocialTab] = useState<SocialTab>('friends');
  // AccountMenu and GameMenu are anchored to the exact same fixed
  // top-right corner (see .reference-account-menu / .reference-game-menu
  // in reference-client.css — the latter inherits `top`/`right` from the
  // former). They used to be two independent booleans, which let Framer
  // Motion mount and cross-fade both of them at once when switching
  // straight from one trigger to the other — two menus animating on top
  // of each other in the identical spot reads as a flicker/glitch. A
  // single mutually-exclusive state, rendered through one
  // `mode="wait"` AnimatePresence below, guarantees the outgoing menu
  // has fully finished its exit animation before the next one mounts.
  const [topMenu, setTopMenu] = useState<'account' | 'game' | 'notifications' | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [clientUpdate, setClientUpdate] = useState<{ version: string; url: string } | null>(null);
  const [updateBannerDismissed, setUpdateBannerDismissed] = useState(false);
  // Games added from the Store during this session — session-only, same
  // as everything else without a backend (see the Community section
  // comment). Library reads `games` + these merged together so an
  // "Added to Library" action in the Store is immediately reflected.
  const [libraryAdditions, setLibraryAdditions] = useState<StoreGame[]>([]);
  const [signedOut, setSignedOut] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsGame, setSettingsGame] = useState<Game | null>(null);
  const title = path === '/games' ? 'Games' : path.startsWith('/games/') ? '' : 'Home';
  const selectedGame = useMemo(
    () => games.find((game) => path === `/games/${game.id}`) ?? games[0],
    [path],
  );
  const currentGame = path.startsWith('/games/') ? selectedGame : null;
  const gameContextClass = currentGame ? ` reference-game-${currentGame.id}` : '';

  // Ref mirror of currentGame so the tray-event listeners below (mounted
  // once, see the empty dependency array) always read the game the user
  // is actually looking at right now, instead of whatever it was when
  // the listeners were first attached.
  const currentGameRef = useRef(currentGame);
  useEffect(() => {
    currentGameRef.current = currentGame;
  }, [currentGame]);

  // Bridges the Windows system tray menu (built in src-tauri/src/lib.rs)
  // to the app's own React state — the tray lives outside the webview,
  // so it can't call setPath/setSignedOut directly and instead emits a
  // Tauri event that we listen for here. No-ops outside Tauri (e.g. `bun
  // run dev` in a plain browser tab), same fallback pattern as
  // lib/window-controls.ts.
  useEffect(() => {
    if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) return;
    let unlistenFns: Array<() => void> = [];
    let cancelled = false;
    (async () => {
      const { listen } = await import('@tauri-apps/api/event');
      if (cancelled) return;
      const offNavigate = await listen<string>('juhra://navigate', (event) => {
        setPath(event.payload);
      });
      const offSettings = await listen('juhra://open-settings', () => {
        setSettingsGame(currentGameRef.current);
        setSettingsOpen(true);
        setTopMenu(null);
        setFriendsOpen(false);
      });
      const offSignOut = await listen('juhra://sign-out', () => {
        setTopMenu(null);
        setSignedOut(true);
      });
      const offUpdate = await listen<{ available: boolean; latestVersion: string; url: string }>(
        'juhra://update-available',
        (event) => {
          if (event.payload.available) {
            setClientUpdate({ version: event.payload.latestVersion, url: event.payload.url });
          }
        },
      );
      if (cancelled) {
        offNavigate();
        offSettings();
        offSignOut();
        offUpdate();
        return;
      }
      unlistenFns = [offNavigate, offSettings, offSignOut, offUpdate];
    })();
    return () => {
      cancelled = true;
      unlistenFns.forEach((off) => off());
    };
  }, []);
  const openGame = (id: string) => setPath(`/games/${id}`);
  const openSocial = (mode: SocialMode = 'friends', tab: SocialTab = 'friends') => {
    setSocialMode(mode);
    setSocialTab(tab);
    setFriendsOpen(true);
    setTopMenu(null);
  };
  const toggleAccount = () => {
    setTopMenu((current) => (current === 'account' ? null : 'account'));
    setFriendsOpen(false);
  };
  const toggleGameMenu = () => {
    setTopMenu((current) => (current === 'game' ? null : 'game'));
    setFriendsOpen(false);
  };
  const toggleNotifications = () => {
    setTopMenu((current) => (current === 'notifications' ? null : 'notifications'));
    setFriendsOpen(false);
  };
  const markNotificationRead = (id: string) => {
    setNotifications((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const markAllNotificationsRead = () => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  };
  const openSettings = () => {
    setSettingsGame(currentGame);
    setSettingsOpen(true);
    setTopMenu(null);
    setFriendsOpen(false);
  };
  const navigateFromAccount = (nextPath: string) => {
    if (nextPath === '/settings') {
      openSettings();
      return;
    }
    setPath(nextPath);
  };

  if (signedOut) {
    return <JuhraSignInGate onSkip={() => setSignedOut(false)} />;
  }

  const content = path === '/'
    ? <Home onOpenGame={openGame} onFriends={() => setFriendsOpen(true)} />
    : path === '/games'
      ? <Games onOpenGame={openGame} />
      : path === '/library'
        ? <Library onOpenGame={openGame} extraGames={libraryAdditions} />
        : path === '/store'
          ? <Store owned={libraryAdditions} onAddToLibrary={(game) => setLibraryAdditions((current) => (current.some((g) => g.id === game.id) ? current : [...current, game]))} />
          : path.startsWith('/games/')
            ? <GameHub game={selectedGame} />
            : <Home onOpenGame={openGame} onFriends={() => setFriendsOpen(true)} />;

  return (
    <motion.div
            key="launcher"
            className={`reference-shell ${theme === 'light' ? 'is-light' : 'is-dark'}${gameContextClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: .35 }}
          >
            <Rail path={path} activeGame={currentGame} onFriends={() => openSocial('friends')} onAccount={toggleAccount} onSettings={openSettings} settingsOpen={settingsOpen} />
             <Topbar title={title} onFriends={() => openSocial('friends')} onGameMenu={toggleGameMenu} onAccount={toggleAccount} onNotifications={toggleNotifications} unreadCount={notifications.filter((n) => !n.read).length} theme={theme} onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
            <AnimatePresence initial={false}>
              {clientUpdate && !updateBannerDismissed && (
                <motion.div
                  key="update-banner"
                  className="reference-update-banner"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: .2, ease: 'easeOut' }}
                >
                  <Sparkles size={14} />
                  <span>Juhra {clientUpdate.version} is available — you're currently on an older version.</span>
                  <button
                    type="button"
                    className="reference-update-banner-download"
                    onClick={async () => {
                      try {
                        const { openUrl } = await import('@tauri-apps/plugin-opener');
                        await openUrl(clientUpdate.url);
                      } catch {
                        window.open(clientUpdate.url, '_blank');
                      }
                    }}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="reference-update-banner-dismiss"
                    aria-label="Dismiss"
                    onClick={() => setUpdateBannerDismissed(true)}
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="reference-content">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={path}
                  className="reference-route"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: .34, ease: [.22, .8, .25, 1] }}
                >
                  {content}
                </motion.div>
              </AnimatePresence>
            </div>
            <MobileRail path={path} />
            <AnimatePresence>
              {friendsOpen && <FriendsPanel key="friends-panel" mode={socialMode} activeGame={selectedGame} tab={socialTab} onTabChange={setSocialTab} onClose={() => setFriendsOpen(false)} />}
              {settingsOpen && <SettingsModal key="settings-modal" activeGame={settingsGame} onClose={() => setSettingsOpen(false)} />}
            </AnimatePresence>
            {/* AccountMenu and GameMenu share one fixed screen anchor (see the
                state comment above), so they get their own `mode="wait"`
                AnimatePresence: the open one always finishes exiting before
                the other is allowed to mount, instead of both cross-fading
                on top of each other in the same spot. */}
            <AnimatePresence mode="wait" initial={false}>
              {topMenu === 'account' && (
                <AccountMenu key="account-menu" onClose={() => setTopMenu(null)} onNavigate={navigateFromAccount} onSignOut={() => { setTopMenu(null); setSignedOut(true); }} />
              )}
              {topMenu === 'game' && (
                <GameMenu key="game-menu" activeGame={currentGame} onClose={() => setTopMenu(null)} onNavigate={setPath} />
              )}
              {topMenu === 'notifications' && (
                <NotificationsMenu
                  key="notifications-menu"
                  notifications={notifications}
                  onClose={() => setTopMenu(null)}
                  onMarkRead={markNotificationRead}
                  onMarkAllRead={markAllNotificationsRead}
                />
              )}
            </AnimatePresence>
    </motion.div>
  );
}

export default function JuhraReferenceClient() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Client />
    </WouterRouter>
  );
}