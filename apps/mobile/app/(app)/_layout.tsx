import { Tabs } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { UserRole } from '@logistics/shared';

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const isDriver = role === UserRole.DRIVER;
  const isFleet = role === UserRole.FLEET_MANAGER || role === UserRole.TRANSPORT_COMPANY;
  const isShipper = role === UserRole.SHIPPER;
  const isAdmin = role === UserRole.ADMIN;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 4, height: 60 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isDriver ? 'Trips' : isFleet ? 'Fleet' : 'Dashboard',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="shipments"
        options={{
          title: 'Shipments',
          href: isDriver || isShipper || isAdmin ? undefined : null,
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'Fleet',
          href: isFleet || isAdmin ? undefined : null,
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Alerts', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{ title: 'AI Help', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: () => null }}
      />
      <Tabs.Screen name="shipment/[id]" options={{ href: null }} />
      <Tabs.Screen name="create-shipment" options={{ href: null }} />
      <Tabs.Screen name="active-trip" options={{ href: null }} />
      <Tabs.Screen name="proof-of-delivery" options={{ href: null }} />
      <Tabs.Screen name="payment" options={{ href: null }} />
      <Tabs.Screen name="tracking" options={{ href: null }} />
    </Tabs>
  );
}
