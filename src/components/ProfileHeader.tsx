"use client";

import { countryNameToEmoji } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    username: string;
    avatar: string;
    country: string;
    coverColor: string;
    coverPhoto: string;
    bio: string;
    totalPosts: number;
    totalComments: number;
    totalBookmarks: number;
    postStreak: number;
    average: number;
    memberSince: string;
    isOwnProfile?: boolean;
  };
}

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dw3o86f8j/image/upload/v1634179812/t%27day/avatars/defaultAvatar2_qyqc9t.png";

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const flag = countryNameToEmoji(user.country);

  const avatarUrl = user.avatar
    ? user.avatar.includes("/upload")
      ? user.avatar.replace("/upload", "/upload/w_200,h_200,c_fill")
      : user.avatar
    : DEFAULT_AVATAR;

  const coverBg = user.coverPhoto
    ? {
        backgroundImage: "url(" + user.coverPhoto + ")",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: user.coverColor || "#2D5F3F" };

  return (
    <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card overflow-hidden mb-4">
      {/* Cover — takes up ~half the card visually */}
      <div className="h-44" style={coverBg} />

      {/* Profile content */}
      <div className="px-5 pb-4">
        {/* Avatar — half over cover, half below */}
        <div className="flex justify-center -mt-11 mb-2">
          <img
            src={avatarUrl}
            alt={user.username}
            className="w-[88px] h-[88px] rounded-full border-[3px] border-white object-cover shadow-md"
          />
        </div>

        {/* Name + handle */}
        <div className="text-center mb-1">
          <h1 className="text-base font-bold text-warm-brown">
            {user.isOwnProfile ? user.username : "Anonymous"}
          </h1>
          <div className="text-[11px] text-warm-gray">
            @{user.username}
            {user.memberSince && (
              <span> · joined {user.memberSince}</span>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs text-warm-brown text-center mb-2 max-w-sm mx-auto leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Flag + country — its own line under bio */}
        {flag && (
          <div className="text-center mb-3">
            <span className="text-lg">{flag}</span>
            {user.country && (
              <span className="text-[11px] text-warm-gray ml-1">{user.country}</span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex justify-center gap-5 text-xs">
          <Stat value={user.totalPosts} label="ratings" />
          <Stat value={user.totalComments} label="comments" />
          <Stat value={user.totalBookmarks} label="bookmarks" />
          <Stat value={user.postStreak} label="streak" />
          <Stat
            value={user.average ? user.average.toFixed(1) : "-"}
            label="avg"
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="text-center">
      <span className="font-bold text-warm-brown">{value}</span>{" "}
      <span className="text-warm-gray">{label}</span>
    </span>
  );
}
