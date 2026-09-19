import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiDiscord, SiEpicgames, SiSteam } from 'react-icons/si';
import loginBackgroundVideo from '../assets/generated_videos/juhra-login-background.mp4';
import fallbackArtwork from '../assets/generated_images/juhra-home-enchanted.png';
import './juhra-sign-in-gate.css';

type JuhraSignInGateProps = {
  onSkip: () => void;
};

const providerOptions = [
  { label: 'Discord', icon: SiDiscord, className: 'juhra-provider-discord' },
  { label: 'Steam', icon: SiSteam, className: 'juhra-provider-steam' },
  { label: 'Epic Games', icon: SiEpicgames, className: 'juhra-provider-epic-games' },
];

export default function JuhraSignInGate({ onSkip }: JuhraSignInGateProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [providerMessage, setProviderMessage] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      setVideoReady(false);
    });
  }, [prefersReducedMotion]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProviderMessage('Sign in is ready for your account connection.');
  };

  return (
    <motion.main
      className="juhra-sign-in-gate"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      data-testid="screen-sign-in-gate"
    >
      <div
        className={`juhra-sign-in-backdrop ${videoReady ? 'is-video-ready' : ''}`}
        style={{ backgroundImage: `url(${fallbackArtwork})` }}
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          className="juhra-sign-in-video"
          autoPlay={!prefersReducedMotion}
          muted
          loop
          playsInline
          poster={fallbackArtwork}
          onCanPlay={() => setVideoReady(true)}
          aria-hidden="true"
          data-testid="video-sign-in-background"
        >
          <source src={loginBackgroundVideo} type="video/mp4" />
        </video>
      </div>
      <div className="juhra-sign-in-atmosphere" aria-hidden="true" />
      <div className="juhra-sign-in-grain" aria-hidden="true" />

      <header className="juhra-sign-in-header">
        <div className="juhra-sign-in-wordmark" aria-label="Juhra">
          <span className="juhra-sign-in-mark" aria-hidden="true">
            <i />
            <i />
          </span>
          <span>JUHRA</span>
        </div>
        <div className="juhra-sign-in-status">
          <span className="juhra-sign-in-status-dot" />
          <span>WORLD // ONLINE</span>
        </div>
      </header>

      <div className="juhra-sign-in-layout">
        <motion.section
          className="juhra-sign-in-panel"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.65, ease: [0.22, 0.8, 0.25, 1] }}
          aria-labelledby="juhra-sign-in-title"
        >
          <div className="juhra-sign-in-panel-glint" aria-hidden="true" />
          <div className="juhra-sign-in-panel-topline">
            <span>PLAYER ACCESS</span>
            <ShieldCheck size={14} aria-hidden="true" />
          </div>
          <div className="juhra-sign-in-heading">
            <span className="juhra-sign-in-mini-mark" aria-hidden="true"><Sparkles size={13} /></span>
            <h2 id="juhra-sign-in-title">Sign in to Juhra</h2>
          </div>
          <p className="juhra-sign-in-lede">Pick up where the silence left off.</p>

          <div className="juhra-sign-in-providers" aria-label="Provider sign in options">
            {providerOptions.map((provider) => {
              const ProviderIcon = provider.icon;

              return (
              <button
                key={provider.label}
                type="button"
                className="juhra-sign-in-provider"
                onClick={() => setProviderMessage(`${provider.label} connection is coming soon.`)}
                data-testid={`button-provider-${provider.label.toLowerCase().replace(' ', '-')}`}
              >
                <span className={`juhra-provider-icon ${provider.className}`} aria-hidden="true">
                  <ProviderIcon size={15} />
                </span>
                <span>{provider.label}</span>
              </button>
              );
            })}
          </div>

          <div className="juhra-sign-in-divider"><span>or use your Juhra account</span></div>

          <form className="juhra-sign-in-form" onSubmit={handleSubmit}>
            <label className="juhra-sign-in-field">
              <span>Username or email</span>
              <span className="juhra-sign-in-input-wrap">
                <Mail size={15} aria-hidden="true" />
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="you@juhra.world"
                  aria-label="Username or email"
                  data-testid="input-username-email"
                />
              </span>
            </label>
            <label className="juhra-sign-in-field">
              <span>Password</span>
              <span className="juhra-sign-in-input-wrap">
                <KeyRound size={15} aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-label="Password"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  className="juhra-sign-in-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </span>
            </label>

            <div className="juhra-sign-in-actions">
              <button type="submit" className="juhra-sign-in-submit" data-testid="button-sign-in">
                <span>Sign in</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
              <button type="button" className="juhra-sign-in-skip" onClick={onSkip} data-testid="button-skip-for-now">
                Skip for now
              </button>
            </div>
          </form>

          <div className="juhra-sign-in-footer">
            <span>New to the worlds?</span>
            <button
              type="button"
              className="juhra-sign-in-create"
              onClick={() => setProviderMessage('Account creation will open soon.')}
              data-testid="link-create-account"
            >
              Create an account
            </button>
          </div>
          {providerMessage && (
            <p className="juhra-sign-in-message" role="status" data-testid="status-sign-in-message">
              {providerMessage}
            </p>
          )}
        </motion.section>
      </div>

      <footer className="juhra-sign-in-footer-bar">
        <span>JUHRA / 2026</span>
        <span className="juhra-sign-in-footer-line" aria-hidden="true" />
        <span>THE FIELD REMEMBERS</span>
      </footer>
    </motion.main>
  );
}