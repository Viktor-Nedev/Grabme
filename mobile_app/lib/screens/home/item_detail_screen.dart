import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';

import '../../providers/app_provider.dart';
import '../../providers/chat_provider.dart';
import '../chat/chat_detail_screen.dart';

class ItemDetailScreen extends StatefulWidget {
  final Map<String, dynamic> item;
  final String type; // 'event', 'request', 'donation'

  const ItemDetailScreen({super.key, required this.item, required this.type});

  @override
  State<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends State<ItemDetailScreen> {
  bool _isWorking = false;

  void _handlePrimaryAction() async {
    final supabase = Supabase.instance.client;
    final user = supabase.auth.currentUser;
    if (user == null) return;

    setState(() => _isWorking = true);

    try {
      if (widget.type == 'event') {
        // Simple join event logic
        await supabase.from('event_participants').insert({
          'event_id': widget.item['id'],
          'profile_id': user.id,
          'status': 'going',
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Successfully joined the event!')),
          );
        }
      } else {
        // Open or create direct chat
        final otherProfileId = widget.type == 'donation' 
            ? (widget.item['profile_id'] ?? widget.item['organization_id']) 
            : widget.item['profile_id'];
            
        if (otherProfileId == null || otherProfileId == user.id) {
          if (mounted) {
             ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Cannot chat with this item/yourself.')),
            );
          }
          return;
        }

        // This is a simplified check for an existing direct chat
        final chatProvider = Provider.of<ChatProvider>(context, listen: false);
        final existingConversation = chatProvider.conversations.firstWhere(
          (c) => c['type'] == 'direct', // We would normally filter by members here
          orElse: () => <String, dynamic>{},
        );

        if (existingConversation.isNotEmpty && mounted) {
           Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ChatDetailScreen(conversation: existingConversation),
            ),
          );
        } else {
           if (mounted) {
             ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Direct chat creation from mobile coming soon.')),
             );
           }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isWorking = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final title = widget.item['title'] ?? 'Details';
    final desc = widget.item['description'] ?? 'No description provided.';
    final address = widget.item['address'] ?? widget.item['location_text'] ?? widget.item['pickup_address'] ?? 'Unknown location';
    final imageUrl = widget.item['image_url'];

    String primaryButtonLabel = 'Contact';
    IconData primaryIcon = LucideIcons.messageCircle;

    if (widget.type == 'event') {
      primaryButtonLabel = 'I Will Attend';
      primaryIcon = LucideIcons.calendarCheck;
    } else if (widget.type == 'donation') {
      primaryButtonLabel = 'Message Donor';
    } else if (widget.type == 'request') {
      primaryButtonLabel = 'Offer Help';
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      backgroundColor: theme.colorScheme.secondary,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (imageUrl != null)
              Image.network(
                imageUrl,
                height: 250,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox(),
              ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      widget.type.toUpperCase(),
                      style: TextStyle(
                        fontSize: 12,
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    title,
                    style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Icon(LucideIcons.mapPin, color: Colors.grey[600], size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          address,
                          style: TextStyle(color: Colors.grey[800], fontSize: 15),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Details',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    desc,
                    style: const TextStyle(height: 1.6, fontSize: 15, color: Colors.black87),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton.icon(
            icon: Icon(primaryIcon, color: Colors.white),
            label: Text(primaryButtonLabel, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: theme.colorScheme.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onPressed: _isWorking ? null : _handlePrimaryAction,
          ),
        ),
      ),
    );
  }
}
