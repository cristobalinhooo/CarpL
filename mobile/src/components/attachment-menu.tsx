import { MaterialIcons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { EvidenceType } from '@/api/evidence';
import { theme } from '@/theme';

interface PickedFile {
  uri: string;
  mimeType: string;
  fileName: string;
}

interface AttachmentMenuProps {
  disabled?: boolean;
  onPicked: (evidenceType: EvidenceType, file: PickedFile) => void;
}

type Panel = 'closed' | 'root' | 'photo' | 'video' | 'audio';

/**
 * Botón "Adjuntar" (Figura 9): despliega Foto/Video/Audio. Foto/Video
 * preguntan cámara o galería (`expo-image-picker`); Audio graba en la
 * app (`expo-audio` — `expo-av` está deprecado en SDK 57, no se usa,
 * confirmado en la documentación versionada real antes de escribir
 * este código). No sube nada acá: solo entrega el archivo elegido a
 * `onPicked`, quien sube y actualiza la línea de tiempo del chat.
 */
export function AttachmentMenu({ disabled = false, onPicked }: AttachmentMenuProps) {
  const [panel, setPanel] = useState<Panel>('closed');
  const [busy, setBusy] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  function close() {
    setPanel('closed');
  }

  async function pickImage(source: 'camera' | 'library', mediaType: 'images' | 'videos') {
    setBusy(true);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: [mediaType], quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: [mediaType],
              quality: 0.7,
            });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const evidenceType: EvidenceType = mediaType === 'images' ? 'IMAGE' : 'VIDEO';
      onPicked(evidenceType, {
        uri: asset.uri,
        mimeType: asset.mimeType ?? (evidenceType === 'IMAGE' ? 'image/jpeg' : 'video/mp4'),
        fileName: asset.fileName ?? `${evidenceType.toLowerCase()}-${Date.now()}`,
      });
    } finally {
      setBusy(false);
      close();
    }
  }

  async function startRecording() {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) return;

    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function stopRecording() {
    await recorder.stop();
    if (recorder.uri) {
      onPicked('AUDIO', {
        uri: recorder.uri,
        mimeType: 'audio/mp4',
        fileName: `audio-${Date.now()}.m4a`,
      });
    }
    close();
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.trigger}
        disabled={disabled}
        onPress={() => setPanel(panel === 'closed' ? 'root' : 'closed')}>
        <MaterialIcons
          name="attach-file"
          size={22}
          color={disabled ? `${theme.colors.textPrimary}66` : theme.colors.actionPrimary}
        />
      </Pressable>

      {panel === 'root' ? (
        <View style={styles.panel}>
          <MenuRow icon="photo-camera" label="Foto" onPress={() => setPanel('photo')} />
          <MenuRow icon="videocam" label="Video" onPress={() => setPanel('video')} />
          <MenuRow icon="mic" label="Audio" onPress={() => setPanel('audio')} />
        </View>
      ) : null}

      {panel === 'photo' || panel === 'video' ? (
        <View style={styles.panel}>
          {busy ? (
            <ActivityIndicator color={theme.colors.actionPrimary} style={styles.busy} />
          ) : (
            <>
              <MenuRow
                icon="photo-camera"
                label={panel === 'photo' ? 'Tomar foto' : 'Grabar video'}
                onPress={() => void pickImage('camera', panel === 'photo' ? 'images' : 'videos')}
              />
              <MenuRow
                icon="photo-library"
                label="Elegir de la galería"
                onPress={() =>
                  void pickImage('library', panel === 'photo' ? 'images' : 'videos')
                }
              />
            </>
          )}
        </View>
      ) : null}

      {panel === 'audio' ? (
        <View style={styles.panel}>
          <Pressable
            style={styles.recordRow}
            onPress={() => void (recorder.isRecording ? stopRecording() : startRecording())}>
            <MaterialIcons
              name={recorder.isRecording ? 'stop-circle' : 'fiber-manual-record'}
              size={22}
              color={theme.colors.danger}
            />
            <Text style={styles.recordText}>
              {recorder.isRecording ? 'Detener grabación' : 'Grabar audio'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <MaterialIcons name={icon} size={20} color={theme.colors.textPrimary} />
      <Text style={styles.menuRowText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  trigger: {
    padding: theme.spacing.space8,
  },
  panel: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: theme.spacing.space8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space12,
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}1A`,
    overflow: 'hidden',
    minWidth: 200,
    elevation: 4,
    shadowColor: theme.colors.textPrimary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space12,
    paddingVertical: theme.spacing.space12,
    paddingHorizontal: theme.spacing.space16,
  },
  menuRowText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  busy: {
    padding: theme.spacing.space16,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space12,
    paddingVertical: theme.spacing.space12,
    paddingHorizontal: theme.spacing.space16,
  },
  recordText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
});
