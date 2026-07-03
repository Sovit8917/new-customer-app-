import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  radius,
  shadow,
} from "../../src/theme";
import {
  CatalogAPI,
  CouponAPI,
  Category,
  Service,
} from "../../src/api/endpoints";
import {
  Card,
  IconBadge,
  SectionHeader,
  RatingTag,
  EmptyState,
} from "../../src/components/ui";
import { useAuth } from "../../src/store/auth-context";

const { width } = Dimensions.get("window");

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Cleaning: "sparkles-outline",
  Plumbing: "water-outline",
  Electrical: "flash-outline",
  Carpentry: "hammer-outline",
  Painting: "brush-outline",
  "Pest Control": "bug-outline",
  "AC Repair": "thermometer-outline",
  "Appliance Repair": "build-outline",
};

const TRUST_ITEMS = [
  {
    icon: "shield-checkmark-outline" as const,
    label: "Verified pros",
    sub: "Background checked",
  },
  {
    icon: "time-outline" as const,
    label: "On-time",
    sub: "Avg. 30 min arrival",
  },
  {
    icon: "pricetag-outline" as const,
    label: "Fair pricing",
    sub: "No hidden fees",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popular, setPopular] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<
    {
      code: string;
      description?: string;
      discountValue?: number;
      discountType?: string;
    }[]
  >([]);
  const load = useCallback(async () => {
    setError(null);

    try {
      const [catRes, popRes, couponRes] = await Promise.all([
        CatalogAPI.getCategories(),
        CatalogAPI.getPopularServices(),
        CouponAPI.getActive().catch(() => ({ data: [] })),
      ]);

      console.log("Categories API:", JSON.stringify(catRes, null, 2));
      console.log("Popular API:", JSON.stringify(popRes, null, 2));
      console.log("Coupons API:", JSON.stringify(couponRes, null, 2));

      // Categories
      const categoriesData =
        catRes?.data?.data ?? catRes?.data?.categories ?? catRes?.data ?? [];

      (setCategories(catRes.data?.data ?? []),
        setPopular(popRes.data?.data ?? []),
        setCoupons((couponRes as any).data?.data ?? []));

      // Popular Services
      const popularData =
        popRes?.data?.data ?? popRes?.data?.services ?? popRes?.data ?? [];

      setPopular(Array.isArray(popularData) ? popularData : []);

      // Coupons
      const couponData =
        couponRes?.data?.data ??
        couponRes?.data?.coupons ??
        couponRes?.data ??
        [];

      setCoupons(Array.isArray(couponData) ? couponData : []);
    } catch (err) {
      console.log("Home Screen Error:", err);
      setError("Could not load services. Pull down to try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleSearch = () => {
    if (search.trim())
      router.push({ pathname: "/service/list", params: { search } });
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ─── Hero gradient ─── */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.hero}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting()},</Text>
              <Text style={styles.userName}>{user?.name ?? "Welcome"} 👋</Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/notifications")}
              style={styles.bellBtn}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={colors.white}
              />
            </Pressable>
          </View>

          {/* Search bar */}
          <Pressable
            onPress={() => router.push("/service/search")}
            style={styles.searchBox}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.textMuted}
            />
            <Text style={styles.searchPlaceholder}>
              What do you need help with?
            </Text>
          </Pressable>
        </LinearGradient>

        {/* ─── Trust badges ─── */}
        <View style={styles.trustRow}>
          {TRUST_ITEMS.map((item) => (
            <Card key={item.label} style={styles.trustCard}>
              <IconBadge name={item.icon} size={20} badgeSize={36} />
              <Text style={styles.trustLabel}>{item.label}</Text>
              <Text style={styles.trustSub}>{item.sub}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.body}>
          {/* ─── Categories ─── */}
          <SectionHeader
            title="Browse by category"
            actionLabel="View all"
            onAction={() => router.push("/service/categories")}
          />

          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginBottom: spacing.xxl }}
            />
          ) : error ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Something went wrong"
              subtitle={error}
            />
          ) : (
            <View style={styles.categoryGrid}>
              {(Array.isArray(categories) ? categories : [])
                .slice(0, 8)
                .map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={({ pressed }) => [
                      styles.catItem,
                      { opacity: pressed ? 0.75 : 1 },
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/service/list",
                        params: { categoryId: cat.id, categoryName: cat.name },
                      })
                    }
                  >
                    <View style={styles.catIconWrap}>
                      <Ionicons
                        name={CATEGORY_ICONS[cat.name] ?? "construct-outline"}
                        size={26}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={styles.catLabel} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
            </View>
          )}

          {/* ─── Popular Services ─── */}
          <SectionHeader
            title="Popular services"
            actionLabel="View all"
            onAction={() => router.push("/service/list")}
          />
          {popular.length === 0 && !loading ? (
            <EmptyState
              icon="construct-outline"
              title="No services yet"
              subtitle="Check back soon!"
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.lg }}
            >
              {(Array.isArray(popular) ? popular : []).map((service) => (
                <Pressable
                  key={service.id}
                  onPress={() =>
                    router.push({
                      pathname: "/service/[id]",
                      params: { id: service.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.serviceCard,
                    { opacity: pressed ? 0.88 : 1 },
                  ]}
                >
                  <View style={styles.serviceImgWrap}>
                    {service.image ? (
                      <Image
                        source={{ uri: service.image }}
                        style={styles.serviceImg}
                      />
                    ) : (
                      <View
                        style={[
                          styles.serviceImg,
                          styles.serviceImgPlaceholder,
                        ]}
                      >
                        <Ionicons
                          name={
                            CATEGORY_ICONS[service.name] ?? "construct-outline"
                          }
                          size={32}
                          color={colors.primary}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName} numberOfLines={2}>
                      {service.name}
                    </Text>
                    <RatingTag
                      rating={service.rating}
                      reviewCount={service.reviewCount}
                    />
                    <Text style={styles.servicePrice}>₹{service.price}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* ─── Emergency Banner ─── */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/service/list",
                params: { emergency: "1" },
              })
            }
            style={styles.emergencyBanner}
          >
            <LinearGradient
              colors={["#E5484D", "#C82B2F"]}
              style={styles.emergencyGrad}
            >
              <View style={styles.emergencyLeft}>
                <Text style={styles.emergencyLabel}>⚡ Emergency Service</Text>
                <Text style={styles.emergencySub}>
                  Get a pro to your door ASAP
                </Text>
              </View>
              <Ionicons
                name="arrow-forward-circle"
                size={36}
                color="rgba(255,255,255,0.85)"
              />
            </LinearGradient>
          </Pressable>

          {/* ─── Offers ─── */}
          {coupons.length > 0 && (
            <>
              <SectionHeader
                title="Offers & Coupons"
                actionLabel="See all"
                onAction={() => router.push("/(tabs)/wallet")}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.lg }}
              >
                {coupons.map((o, i) => (
                  <LinearGradient
                    key={o.code}
                    colors={
                      OFFER_GRADIENTS[i % OFFER_GRADIENTS.length] as [
                        string,
                        string,
                      ]
                    }
                    style={styles.offerCard}
                  >
                    <Text style={styles.offerCode}>{o.code}</Text>
                    <Text style={styles.offerDesc}>
                      {o.description ?? "Special offer"}
                    </Text>
                    <View style={styles.offerPill}>
                      <Text style={styles.offerPillText}>
                        {o.discountType === "PERCENTAGE"
                          ? `${o.discountValue}%`
                          : `₹${o.discountValue}`}{" "}
                        OFF
                      </Text>
                    </View>
                  </LinearGradient>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const OFFER_GRADIENTS = [
  ["#1A5FE8", "#3B7BFF"],
  ["#19A463", "#22C47A"],
  ["#E8910A", "#F5A623"],
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl + spacing.xl,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.8)",
    fontWeight: fontWeight.medium,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    height: 50,
    gap: spacing.sm,
    ...shadow.raised,
  },
  searchPlaceholder: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    flex: 1,
  },

  trustRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: -spacing.xxl,
    marginBottom: spacing.xxl,
  },
  trustCard: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: "flex-start",
  },
  trustLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  trustSub: { fontSize: 10, color: colors.textMuted, lineHeight: 14 },

  body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  catItem: {
    width: (width - spacing.xl * 2 - spacing.sm * 3) / 4,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  catIconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.subtle,
  },
  catLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },

  serviceCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadow.card,
  },
  serviceImgWrap: { width: 160, height: 110 },
  serviceImg: { width: 160, height: 110 },
  serviceImgPlaceholder: {
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceInfo: { padding: spacing.md, gap: spacing.xs },
  serviceName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  servicePrice: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },

  emergencyBanner: {
    borderRadius: radius.xl,
    overflow: "hidden",
    marginVertical: spacing.xxl,
  },
  emergencyGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.xl,
  },
  emergencyLeft: { gap: spacing.xs },
  emergencyLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
  },
  emergencySub: { fontSize: fontSize.sm, color: "rgba(255,255,255,0.85)" },

  offerCard: {
    width: 200,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  offerCode: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
  },
  offerDesc: { fontSize: fontSize.xs, color: "rgba(255,255,255,0.85)" },
  offerPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  offerPillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
