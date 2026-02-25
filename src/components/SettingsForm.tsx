"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { countries } from "@/lib/countries";
import {
  updateProfile,
  updateAccount,
  changePassword,
  deleteAccount,
} from "@/app/actions/settings";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dw3o86f8j/image/upload/v1634179812/t%27day/avatars/defaultAvatar2_qyqc9t.png";

const TABS = [
  { key: "profile", label: "Profile", icon: "fas fa-user-circle" },
  { key: "account", label: "Account", icon: "fas fa-cog" },
  { key: "password", label: "Password", icon: "fas fa-key" },
  { key: "resources", label: "Resources", icon: "fas fa-info-circle" },
  { key: "delete", label: "Delete Account", icon: "fas fa-user-times" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface SettingsFormProps {
  user: {
    username: string;
    email: string;
    avatar: string;
    coverPhoto: string;
    coverPhotoPosition: string;
    coverColor: string;
    bio: string;
    country: string;
    ageGroup: string;
    gender: string;
    memberSince: string;
  };
}

function parseCoverPosition(pos: string): { x: number; y: number } {
  if (!pos) return { x: 50, y: 50 };
  const cleaned = pos.replace(/%/g, "");
  const parts = cleaned.trim().split(/\s+/);
  return {
    x: parseFloat(parts[0]) || 50,
    y: parseFloat(parts[1]) || 50,
  };
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile state
  const [bio, setBio] = useState(user.bio);
  const [coverColor, setCoverColor] = useState(user.coverColor);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || DEFAULT_AVATAR);
  const [coverPreview, setCoverPreview] = useState(user.coverPhoto);
  const [coverPosition, setCoverPosition] = useState(parseCoverPosition(user.coverPhotoPosition));
  const [savedPosition, setSavedPosition] = useState(parseCoverPosition(user.coverPhotoPosition));
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Reposition state
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 50, posY: 50 });
  const coverRef = useRef<HTMLDivElement>(null);

  // Account state
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [country, setCountry] = useState(user.country);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete state
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // ─── Cover photo reposition drag ───────────────────────────────────
  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!isRepositioning) return;
      setIsDragging(true);
      dragStartRef.current = {
        x: clientX,
        y: clientY,
        posX: coverPosition.x,
        posY: coverPosition.y,
      };
    },
    [isRepositioning, coverPosition]
  );

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      const sensitivity = 0.3;
      setCoverPosition({
        x: Math.max(0, Math.min(100, dragStartRef.current.posX - dx * sensitivity)),
        y: Math.max(0, Math.min(100, dragStartRef.current.posY - dy * sensitivity)),
      });
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  // Global move/up handlers (so drag works outside the element)
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // ─── Profile save ──────────────────────────────────────────────────
  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("bio", bio);
      formData.set("coverColor", coverColor);

      if (avatarInputRef.current?.files?.[0]) {
        formData.set("avatar", avatarInputRef.current.files[0]);
      }
      if (coverInputRef.current?.files?.[0]) {
        formData.set("coverPhoto", coverInputRef.current.files[0]);
      }

      // Send position as valid CSS value
      const posStr = `${coverPosition.x}% ${coverPosition.y}%`;
      formData.set("coverPhotoPosition", posStr);

      const result = await updateProfile(formData);
      if (result.error) {
        showMessage("error", result.error);
      } else {
        showMessage("success", "Profile updated");
        setSavedPosition(coverPosition);
        router.refresh();
      }
    } catch {
      showMessage("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Remove cover photo ────────────────────────────────────────────
  const handleRemoveCover = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("bio", bio);
      formData.set("coverColor", coverColor);
      formData.set("removeCoverPhoto", "true");

      const result = await updateProfile(formData);
      if (result.error) {
        showMessage("error", result.error);
      } else {
        setCoverPreview("");
        setCoverPosition({ x: 50, y: 50 });
        setSavedPosition({ x: 50, y: 50 });
        showMessage("success", "Cover photo removed");
        router.refresh();
      }
    } catch {
      showMessage("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Account save ──────────────────────────────────────────────────
  const handleAccountSave = async () => {
    setLoading(true);
    try {
      const result = await updateAccount({
        username: username !== user.username ? username : undefined,
        email: email !== user.email ? email : undefined,
        countryName: country !== user.country ? country : undefined,
      });
      if (result.error) {
        showMessage("error", result.error);
      } else {
        showMessage("success", "Account updated");
        router.refresh();
      }
    } catch {
      showMessage("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Password save ────────────────────────────────────────────────
  const handlePasswordSave = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("error", "Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const result = await changePassword({ oldPassword, newPassword, confirmPassword });
      if (result.error) {
        showMessage("error", result.error);
      } else {
        showMessage("success", "Password changed");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      showMessage("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete account ────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const result = await deleteAccount({ password: deletePassword });
      if (result.error) {
        showMessage("error", result.error);
        setShowDeleteModal(false);
      } else {
        await signOut({ callbackUrl: "/" });
      }
    } catch {
      showMessage("error", "Something went wrong");
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  // ─── Image preview handlers ────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
      setCoverPosition({ x: 50, y: 50 });
    }
  };

  const isDemo = user.username === "demo";
  const hasCover = Boolean(coverPreview);
  const coverBgStyle = hasCover
    ? {
        backgroundImage: `url(${coverPreview})`,
        backgroundSize: "cover" as const,
        backgroundPosition: `${coverPosition.x}% ${coverPosition.y}%`,
      }
    : { backgroundColor: coverColor };

  return (
    <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-warm-border/20">
        <h1 className="text-lg font-bold text-warm-brown">Settings</h1>
        <p className="text-xs text-warm-gray mt-0.5">
          @{user.username} · member since {user.memberSince}
        </p>
      </div>

      {/* Toast message */}
      {message && (
        <div
          className={
            "mx-5 mt-4 px-3 py-2 rounded-lg text-sm " +
            (message.type === "success"
              ? "bg-forest/10 text-forest border border-forest/20"
              : "bg-red-50 text-red-700 border border-red-200")
          }
        >
          <i
            className={
              "fas mr-2 " +
              (message.type === "success" ? "fa-check-circle" : "fa-exclamation-circle")
            }
          />
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar tabs — vertical on lg, horizontal scroll on mobile */}
        <div className="lg:w-56 lg:shrink-0 lg:border-r lg:border-warm-border/20">
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible p-2 lg:p-3 gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors " +
                  (activeTab === tab.key
                    ? "bg-forest/10 text-forest font-medium"
                    : "text-warm-gray hover:text-warm-brown hover:bg-cream-light/50")
                }
              >
                <i className={tab.icon + " text-xs"} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 p-5 lg:p-6">
          {/* ─── Profile tab ──────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-warm-brown">Profile</h2>

              {/* Avatar */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-2">Avatar</label>
                <div className="flex items-center gap-4">
                  <img
                    src={
                      avatarPreview.includes("/upload")
                        ? avatarPreview.replace("/upload", "/upload/w_80,h_80,c_fill")
                        : avatarPreview
                    }
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-warm-border/30"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-sm text-forest hover:text-forest-hover transition-colors"
                  >
                    Change avatar
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* Cover photo */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-2">
                  Cover Photo
                </label>

                {/* Preview */}
                <div
                  ref={coverRef}
                  className={
                    "h-28 rounded-xl border border-warm-border/30 overflow-hidden relative select-none " +
                    (isRepositioning ? "cursor-grab active:cursor-grabbing" : "")
                  }
                  style={coverBgStyle}
                  onMouseDown={isRepositioning ? onMouseDown : undefined}
                  onTouchStart={isRepositioning ? onTouchStart : undefined}
                >
                  {/* Reposition overlay */}
                  {isRepositioning && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <span className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">
                        <i className="fas fa-arrows-alt mr-1.5" />
                        Drag to reposition
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons below cover */}
                <div className="flex items-center gap-3 mt-2">
                  {!isRepositioning ? (
                    <>
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="text-xs text-forest hover:text-forest-hover transition-colors"
                      >
                        <i className="fas fa-camera mr-1" />
                        {hasCover ? "Change" : "Upload"}
                      </button>
                      {hasCover && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSavedPosition(coverPosition);
                              setIsRepositioning(true);
                            }}
                            className="text-xs text-forest hover:text-forest-hover transition-colors"
                          >
                            <i className="fas fa-arrows-alt mr-1" />
                            Reposition
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveCover}
                            disabled={loading}
                            className="text-xs text-red-500 hover:text-red-600 transition-colors"
                          >
                            <i className="fas fa-trash-alt mr-1" />
                            Remove
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsRepositioning(false)}
                        className="text-xs text-forest hover:text-forest-hover font-medium transition-colors"
                      >
                        <i className="fas fa-check mr-1" />
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCoverPosition(savedPosition);
                          setIsRepositioning(false);
                        }}
                        className="text-xs text-warm-gray hover:text-warm-brown transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>

              {/* Cover color */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-2">
                  Cover Color
                  <span className="text-[10px] ml-1">(used when no cover photo)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={coverColor}
                    onChange={(e) => setCoverColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-warm-border/30 cursor-pointer"
                  />
                  <span className="text-xs text-warm-gray font-mono">{coverColor}</span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none"
                />
                <p className="text-[10px] text-warm-gray mt-1">{bio.length}/500</p>
              </div>

              <button
                onClick={handleProfileSave}
                disabled={loading}
                className="bg-forest text-cream-light text-sm font-medium px-5 py-2 rounded-lg hover:bg-forest-hover transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}

          {/* ─── Account tab ──────────────────────────────────── */}
          {activeTab === "account" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-warm-brown">Account Information</h2>

              {isDemo && (
                <div className="bg-forest/10 border-l-3 border-forest text-forest text-sm px-3 py-2 rounded-r-lg">
                  <i className="fas fa-info-circle mr-2" />
                  <strong>Demo Account:</strong> Changes are disabled for the demo account.
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1">
                  <i className="fas fa-at text-forest mr-1" />
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isDemo}
                  className="w-full max-w-sm text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30 disabled:opacity-50"
                />
                <p className="text-[10px] text-warm-gray mt-1">
                  3-16 characters, letters, numbers, and underscores only.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1">
                  <i className="fas fa-envelope text-forest mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isDemo}
                  className="w-full max-w-sm text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30 disabled:opacity-50"
                />
              </div>

              {/* Age Group (read-only) */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1">
                  <i className="fas fa-birthday-cake text-forest mr-1" />
                  Age Group
                </label>
                <input
                  type="text"
                  value={user.ageGroup || "Not set"}
                  disabled
                  className="w-full max-w-sm text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-dark/50 text-warm-gray cursor-not-allowed"
                />
                <p className="text-[10px] text-warm-gray mt-1">This value cannot be changed.</p>
              </div>

              {/* Gender (read-only) */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1">
                  <i className="fas fa-venus-mars text-forest mr-1" />
                  Gender
                </label>
                <input
                  type="text"
                  value={user.gender || "Not set"}
                  disabled
                  className="w-full max-w-sm text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-dark/50 text-warm-gray cursor-not-allowed"
                />
                <p className="text-[10px] text-warm-gray mt-1">This value cannot be changed.</p>
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1">
                  <i className="fas fa-globe-americas text-forest mr-1" />
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={isDemo}
                  className="w-full max-w-sm text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30 disabled:opacity-50"
                >
                  <option value="">Select a country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {!isDemo && (
                <button
                  onClick={handleAccountSave}
                  disabled={loading}
                  className="bg-forest text-cream-light text-sm font-medium px-5 py-2 rounded-lg hover:bg-forest-hover transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Update Account"}
                </button>
              )}
            </div>
          )}

          {/* ─── Password tab ─────────────────────────────────── */}
          {activeTab === "password" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-warm-brown">Change Password</h2>

              {isDemo ? (
                <div className="bg-forest/10 border-l-3 border-forest text-forest text-sm px-3 py-2 rounded-r-lg">
                  <i className="fas fa-info-circle mr-2" />
                  <strong>Demo Account:</strong> Password changes are disabled.
                </div>
              ) : (
                <>
                  <p className="text-xs text-warm-gray">
                    Password must be at least 8 characters and contain at least one uppercase letter,
                    one lowercase letter, and one number.
                  </p>

                  <div>
                    <label className="block text-xs font-medium text-warm-gray mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full max-w-sm text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-warm-gray mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full max-w-sm text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-warm-gray mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full max-w-sm text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-forest/30"
                    />
                  </div>

                  <button
                    onClick={handlePasswordSave}
                    disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                    className="bg-forest text-cream-light text-sm font-medium px-5 py-2 rounded-lg hover:bg-forest-hover transition-colors disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Change Password"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ─── Resources tab ────────────────────────────────── */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-warm-brown">Additional Resources</h2>
              <div className="space-y-2">
                {[
                  { href: "/contact", label: "Contact", icon: "fas fa-envelope" },
                  { href: "/terms", label: "Terms of Use", icon: "fas fa-file-alt" },
                  { href: "/privacy", label: "Privacy Policy", icon: "fas fa-shield-alt" },
                  { href: "/cookies", label: "Cookie Policy", icon: "fas fa-cookie-bite" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-forest hover:text-forest-hover transition-colors py-1"
                  >
                    <i className={link.icon + " text-xs w-4 text-center"} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ─── Delete Account tab ───────────────────────────── */}
          {activeTab === "delete" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-red-600">Delete Account</h2>

              {isDemo ? (
                <div className="bg-forest/10 border-l-3 border-forest text-forest text-sm px-3 py-2 rounded-r-lg">
                  <i className="fas fa-info-circle mr-2" />
                  <strong>Demo Account:</strong> This account cannot be deleted.
                </div>
              ) : (
                <>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    This will permanently, irreversibly remove your account and delete it from our
                    database. This includes all of your account information, ratings, comments,
                    bookmarks, journals, and data.
                  </p>

                  <div>
                    <label className="block text-xs font-medium text-warm-gray mb-1">
                      Enter your password to confirm
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full max-w-sm text-sm border border-warm-border/40 rounded-lg px-3 py-2 bg-cream-light text-warm-brown focus:outline-none focus:ring-2 focus:ring-red-300/50"
                    />
                  </div>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={!deletePassword}
                    className="bg-red-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Delete Account
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-warm-brown mb-2">Are you sure?</h3>
            <p className="text-sm text-warm-gray mb-5">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-cream-dark text-warm-brown text-sm font-medium py-2 rounded-lg hover:bg-warm-border/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
