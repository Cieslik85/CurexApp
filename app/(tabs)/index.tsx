import { StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MultiCurrencyConverter } from '@/components/converter/MultiCurrencyConverter';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>CurexApp</Text>
            <Text style={styles.subtitle}>Real-time Multi-Currency Exchange</Text>
          </View>
        </View>
      </View>
      <MultiCurrencyConverter />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 60,
    height: 70,
    resizeMode: 'contain',
    marginRight: 1,
    marginLeft: 20,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});