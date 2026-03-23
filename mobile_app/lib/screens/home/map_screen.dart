import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import 'item_detail_screen.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final _mapController = MapController();

  Marker _buildIconMarker(LatLng point, Color color, IconData icon, Map<String, dynamic> item, String type) {
    return Marker(
      point: point,
      width: 40,
      height: 40,
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ItemDetailScreen(item: item, type: type),
            ),
          );
        },
        child: Container(
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = Provider.of<AppProvider>(context);
    final theme = Theme.of(context);

    // Filter maps markers coordinates dynamically
    List<Marker> markers = [];
    
    for (var event in appProvider.events) {
      if (event['lat'] != null && event['lng'] != null) {
        markers.add(_buildIconMarker(
          LatLng(event['lat'], event['lng']),
          Colors.purple,
          Icons.event,
          event,
          'event',
        ));
      }
    }

    for (var req in appProvider.requests) {
      if (req['lat'] != null && req['lng'] != null) {
        markers.add(_buildIconMarker(
          LatLng(req['lat'], req['lng']),
          theme.colorScheme.primary,
          Icons.pan_tool,
          req,
          'request',
        ));
      }
    }

    for (var don in appProvider.donations) {
      if (don['lat'] != null && don['lng'] != null) {
        markers.add(_buildIconMarker(
          LatLng(don['lat'], don['lng']),
          Colors.green,
          Icons.shopping_bag,
          don,
          'donation',
        ));
      }
    }

    return Scaffold(
      body: appProvider.isLoading
        ? const Center(child: CircularProgressIndicator())
        : FlutterMap(
            mapController: _mapController,
            options: const MapOptions(
              initialCenter: LatLng(42.6977, 23.3219), // Center on Sofia
              initialZoom: 13.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.viktornedev08.grabme',
              ),
              MarkerLayer(markers: markers),
            ],
          ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _mapController.move(const LatLng(42.6977, 23.3219), 14);
        },
        child: const Icon(Icons.my_location),
      ),
    );
  }
}
