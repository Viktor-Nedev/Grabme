import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../providers/auth_provider.dart';
import '../../providers/app_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final appProvider = Provider.of<AppProvider>(context);
    final theme = Theme.of(context);
    
    final user = Supabase.instance.client.auth.currentUser;
    final profile = appProvider.profiles.firstWhere(
      (p) => p['id'] == user?.id,
      orElse: () => {},
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
            child: Text(
              (profile['name']?.toString() ?? 'U').substring(0, 1).toUpperCase(),
              style: TextStyle(
                fontSize: 40,
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            profile['name'] ?? 'Loading...',
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          Text(
            user?.email ?? '',
            style: const TextStyle(color: Colors.black54),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              (profile['role'] ?? 'USER').toString().toUpperCase(),
              style: TextStyle(
                fontSize: 12,
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 48),

          ListTile(
            leading: Icon(LucideIcons.mapPin, color: theme.colorScheme.primary),
            title: const Text('Location'),
            subtitle: Text(profile['location_text'] ?? 'Not set'),
            trailing: const Icon(LucideIcons.chevronRight, size: 20),
            onTap: () {},
          ),
          const Divider(),
          ListTile(
            leading: Icon(LucideIcons.settings, color: theme.colorScheme.primary),
            title: const Text('Account Settings'),
            trailing: const Icon(LucideIcons.chevronRight, size: 20),
            onTap: () {},
          ),
          const Divider(),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              icon: const Icon(LucideIcons.logOut, color: Colors.red),
              label: const Text('Sign Out', style: TextStyle(color: Colors.red)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: () {
                authProvider.signOut();
              },
            ),
          ),
        ],
      ),
    );
  }
}
