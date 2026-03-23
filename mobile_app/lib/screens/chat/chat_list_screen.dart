import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../providers/chat_provider.dart';
import 'chat_detail_screen.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final chatProvider = Provider.of<ChatProvider>(context);
    final theme = Theme.of(context);
    final user = Supabase.instance.client.auth.currentUser;

    if (chatProvider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final memberships = chatProvider.conversationMembers
        .where((m) => m['profile_id'] == user?.id)
        .map((m) => m['conversation_id'])
        .toSet();

    final conversations = chatProvider.conversations
        .where((c) => memberships.contains(c['id']))
        .toList();

    if (conversations.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.messageSquare, size: 48, color: theme.colorScheme.primary),
            const SizedBox(height: 16),
            const Text('No conversations yet.', style: TextStyle(color: Colors.black54)),
          ],
        ),
      );
    }

    return ListView.separated(
      itemCount: conversations.length,
      separatorBuilder: (_, __) => const Divider(height: 1, indent: 16, endIndent: 16),
      itemBuilder: (context, index) {
        final conv = conversations[index];
        final isGroup = conv['type'] == 'group';
        final title = conv['title'] ?? (isGroup ? 'Group Chat' : 'Direct Chat');

        return ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          leading: CircleAvatar(
            backgroundColor: isGroup ? theme.colorScheme.primary.withOpacity(0.1) : Colors.grey[200],
            child: Icon(
              isGroup ? LucideIcons.users : LucideIcons.user,
              color: isGroup ? theme.colorScheme.primary : Colors.black54,
            ),
          ),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: const Text('Tap to view messages...', maxLines: 1), // Placeholder for actual last msg
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ChatDetailScreen(conversation: conv),
              ),
            );
          },
        );
      },
    );
  }
}
