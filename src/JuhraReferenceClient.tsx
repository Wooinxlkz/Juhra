import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronLeft,
  Gamepad2,
  Grid2X2,
  Home as HomeIcon,
  List,
  LogOut,
  MessageCircle,
  Play,
  Search,
  Settings,
  Sun,
  UserPlus,
  UserRound,
  Users,
  UsersRound,
  Volume2,
  X,
  Moon,
} from 'lucide-react';
import { Link, Router as WouterRouter, useLocation } from 'wouter';
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
          >
            {label}
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
  theme,
  onThemeToggle,
}: {
  title: string;
  onFriends: () => void;
  onGameMenu: () => void;
  onAccount: () => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}) {
  return (
    <header className="reference-topbar">
      <div className="reference-topbar-title">{title}</div>
      <div className="reference-topbar-actions">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
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

function CommunityContent({ game }: { game: Game }) {
  const discussions = [
    { title: `What was your first route through ${game.title}?`, author: 'Mara Voss', replies: 18, time: '2h ago' },
    { title: 'Share your favorite field note', author: 'Jules Ahn', replies: 32, time: '5h ago' },
    { title: 'Theories for the next chapter', author: 'ceed', replies: 64, time: '1d ago' },
  ];
  return (
    <section className="reference-community">
      <header className="reference-community-header">
        <div>
          <div className="reference-kicker">Community · {game.title}</div>
          <h1>{game.title} Community</h1>
          <p>Talk about routes, discoveries, and everything happening in the world of {game.title}.</p>
        </div>
        <button className="reference-community-start" type="button"><MessageCircle size={14} /> Start a discussion</button>
      </header>
      <div className="reference-community-layout">
        <div className="reference-community-discussions">
          <div className="reference-community-section-title">
            <span>Recent discussions</span>
            <span>{discussions.length} active</span>
          </div>
          {discussions.map((discussion) => (
            <button className="reference-discussion-row" key={discussion.title} type="button">
              <span className="reference-discussion-icon"><MessageCircle size={15} /></span>
              <span className="reference-discussion-copy">
                <strong>{discussion.title}</strong>
                <small>{discussion.author} · {discussion.time}</small>
              </span>
              <span className="reference-discussion-replies">{discussion.replies}</span>
            </button>
          ))}
        </div>
        <aside className="reference-community-sidebar">
          <span>About this community</span>
          <strong>{game.title}</strong>
          <p>A place for players to share quiet discoveries and compare the choices that shape every run.</p>
          <div><UsersRound size={13} /> 12.4k members</div>
          <div><MessageCircle size={13} /> Open discussions</div>
        </aside>
      </div>
    </section>
  );
}

function GameHub({ game }: { game: Game }) {
  const [tab, setTab] = useState('Overview');
  const tabs = ['Overview', 'Patch Notes', 'Merch', 'Community'];
  const isPatchNotes = tab === 'Patch Notes';
  const isMerch = tab === 'Merch';
  const isCommunity = tab === 'Community';
  const isSecondaryTab = isPatchNotes || isMerch || isCommunity;
  return (
    <main className={`reference-page reference-hub-page reference-game-${game.id} ${game.art} ${isSecondaryTab ? 'is-secondary-tab' : ''} ${isPatchNotes ? 'is-patch-notes' : ''} ${isMerch ? 'is-merch' : ''} ${isCommunity ? 'is-community' : ''}`}>
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
      {isPatchNotes ? (
        <PatchNotesContent game={game} />
      ) : isMerch ? (
        <MerchContent game={game} />
      ) : isCommunity ? (
        <CommunityContent game={game} />
      ) : (
        <>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              className="reference-hub-copy"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: .28, ease: [.22, .8, .25, 1] }}
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
      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: .72 }}
      style={{ transformOrigin: 'top right' }}
      className={`reference-social-panel ${mode === 'in-game' ? 'is-ingame' : ''}`}
    >
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
    >
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
    >
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
        className={`reference-settings-modal ${contextGame ? 'has-game-context reference-game-context reference-game-${contextGame.id}' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reference-settings-title"
        initial={{ opacity: 0, y: 18, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: .98 }}
        transition={{ duration: .2, ease: 'easeOut' }}
        onMouseDown={(event) => event.stopPropagation()}
      >
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
                  checked={openOnStartup}
                  onChange={() => setOpenOnStartup((value) => !value)}
                />
                <SettingsToggle
                  label="Friend activity"
                  detail="Notify me when friends enter a world."
                  checked={gameAudio}
                  onChange={() => setGameAudio((value) => !value)}
                />
              </div>
            ) : section === 'client-social' ? (
              <div className="reference-settings-content">
                <SettingsToggle
                  label="Show me as online"
                  detail="Let friends see when you are exploring Juhra."
                  checked={openOnStartup}
                  onChange={() => setOpenOnStartup((value) => !value)}
                />
                <SettingsToggle
                  label="Allow party invitations"
                  detail="Friends can invite you to explore a world together."
                  checked={gameAudio}
                  onChange={() => setGameAudio((value) => !value)}
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
              </div>
            )}
          </main>
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
  const [accountOpen, setAccountOpen] = useState(false);
  const [gameMenuOpen, setGameMenuOpen] = useState(false);
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
  const openGame = (id: string) => setPath(`/games/${id}`);
  const openSocial = (mode: SocialMode = 'friends', tab: SocialTab = 'friends') => {
    setSocialMode(mode);
    setSocialTab(tab);
    setFriendsOpen(true);
    setAccountOpen(false);
    setGameMenuOpen(false);
  };
  const toggleAccount = () => {
    setAccountOpen((open) => !open);
    setFriendsOpen(false);
    setGameMenuOpen(false);
  };
  const toggleGameMenu = () => {
    setGameMenuOpen((open) => !open);
    setFriendsOpen(false);
    setAccountOpen(false);
  };
  const openSettings = () => {
    setSettingsGame(currentGame);
    setSettingsOpen(true);
    setAccountOpen(false);
    setFriendsOpen(false);
    setGameMenuOpen(false);
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
             <Topbar title={title} onFriends={() => openSocial('friends')} onGameMenu={toggleGameMenu} onAccount={toggleAccount} theme={theme} onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
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
              {friendsOpen && <FriendsPanel mode={socialMode} activeGame={selectedGame} tab={socialTab} onTabChange={setSocialTab} onClose={() => setFriendsOpen(false)} />}
              {accountOpen && <AccountMenu onClose={() => setAccountOpen(false)} onNavigate={navigateFromAccount} onSignOut={() => { setAccountOpen(false); setSignedOut(true); }} />}
              {gameMenuOpen && <GameMenu activeGame={currentGame} onClose={() => setGameMenuOpen(false)} onNavigate={setPath} />}
              {settingsOpen && <SettingsModal activeGame={settingsGame} onClose={() => setSettingsOpen(false)} />}
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