import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUserProfileData } from "@/actions/gamification";
import { LevelProgress } from "@/components/gamification/level-progress";
import { BadgeCard } from "@/components/gamification/badge-card";
import { StatsOverview } from "@/components/gamification/stats-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, CalendarDays, Star, Trophy } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getUserProfileData(username);
  if (!data) return { title: "User not found" };
  return { title: `${data.user.name} — TravelDiary`, description: data.user.bio ?? undefined };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getUserProfileData(username);
  if (!data) notFound();

  const { user, stats, userBadges, approvedPlaces, progress, levelData, leaderboardRank } = data;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
        <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 shrink-0" style={{ borderColor: levelData.color }}>
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ""} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {user.username && <span className="text-muted-foreground text-sm">@{user.username}</span>}
            <Badge style={{ backgroundColor: levelData.color, color: "white" }}>
              {levelData.emoji} {levelData.name}
            </Badge>
            {leaderboardRank && leaderboardRank <= 10 && (
              <Badge variant="secondary" className="gap-1">
                <Trophy className="h-3 w-3" /> #{leaderboardRank}
              </Badge>
            )}
          </div>
          {user.bio && <p className="text-muted-foreground mt-1 text-sm">{user.bio}</p>}
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="w-full md:w-64">
          {stats ? (
            <LevelProgress totalXp={stats.totalXp} level={stats.level} />
          ) : (
            <div className="p-4 border rounded-xl text-center text-sm text-muted-foreground">No activity yet</div>
          )}
        </div>
      </div>

      {/* Coin & XP summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "XP", value: stats.xp.toLocaleString(), emoji: "⚡" },
            { label: "Coins", value: stats.coins.toLocaleString(), emoji: "🪙" },
            { label: "Badges", value: userBadges.length, emoji: "🏅" },
            { label: "Rank", value: leaderboardRank ? `#${leaderboardRank}` : "—", emoji: "🏆" },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold">{s.emoji} {s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="contributions">
        <TabsList className="mb-6">
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="badges">Badges ({userBadges.length})</TabsTrigger>
          {stats && <TabsTrigger value="stats">Stats</TabsTrigger>}
        </TabsList>

        <TabsContent value="contributions">
          {approvedPlaces.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No approved places yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {approvedPlaces.map((place) => (
                <Link href={`/places/${place.slug}`} key={place.id}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    {place.featuredImage && (
                      <div className="relative h-36 w-full">
                        <Image src={place.featuredImage} alt={place.title} fill className="object-cover" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm line-clamp-1">{place.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{place.city}, {place.state}
                      </p>
                      {place.averageRating > 0 && (
                        <p className="text-xs flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {place.averageRating.toFixed(1)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges">
          {userBadges.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No badges earned yet. Start contributing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {userBadges.map((ub) => (
                <BadgeCard
                  key={ub.id}
                  name={ub.badge.name}
                  description={ub.badge.description}
                  icon={ub.badge.icon}
                  type={ub.badge.type}
                  rarity={ub.badge.rarity}
                  earned={true}
                  earnedAt={ub.earnedAt}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {stats && (
          <TabsContent value="stats">
            <StatsOverview
              xp={stats.xp}
              coins={stats.coins}
              level={stats.level}
              approvedPlaces={stats.approvedPlaces}
              totalReviews={stats.totalReviews}
              totalPhotos={stats.totalPhotos}
              totalLikes={stats.totalLikes}
              hiddenGems={stats.hiddenGems}
              streak={stats.streak}
              leaderboardRank={leaderboardRank}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
