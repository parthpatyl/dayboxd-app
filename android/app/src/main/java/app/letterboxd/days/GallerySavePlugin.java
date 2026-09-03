package app.letterboxd.days;

import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "GallerySave")
public class GallerySavePlugin extends Plugin {

    /**
     * Saves a PNG file from the app's cache/filesystem to the device Gallery (Pictures/Dayboxd).
     * Call: GallerySave.saveToGallery({ filePath: "file:///path/to/image.png", fileName: "DayReel_xxx.png" })
     */
    @PluginMethod
    public void saveToGallery(PluginCall call) {
        String filePath = call.getString("filePath");
        String fileName = call.getString("fileName", "DayReel.png");

        if (filePath == null || filePath.isEmpty()) {
            call.reject("filePath is required");
            return;
        }

        // Strip file:// prefix if present
        if (filePath.startsWith("file://")) {
            filePath = filePath.substring(7);
        }

        File sourceFile = new File(filePath);
        if (!sourceFile.exists()) {
            call.reject("File does not exist: " + filePath);
            return;
        }

        try {
            Context context = getContext();
            Uri savedUri;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ — use MediaStore (no WRITE_EXTERNAL_STORAGE needed)
                ContentValues values = new ContentValues();
                values.put(MediaStore.Images.Media.DISPLAY_NAME, fileName);
                values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                values.put(MediaStore.Images.Media.RELATIVE_PATH,
                        Environment.DIRECTORY_PICTURES + "/Dayboxd");
                values.put(MediaStore.Images.Media.IS_PENDING, 1);

                savedUri = context.getContentResolver()
                        .insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);

                if (savedUri == null) {
                    call.reject("Could not create MediaStore entry");
                    return;
                }

                try (OutputStream outputStream = context.getContentResolver().openOutputStream(savedUri);
                     InputStream inputStream = new FileInputStream(sourceFile)) {

                    if (outputStream == null) {
                        call.reject("Could not open output stream");
                        return;
                    }

                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                }

                // Mark as complete — makes it visible in gallery immediately
                values.clear();
                values.put(MediaStore.Images.Media.IS_PENDING, 0);
                context.getContentResolver().update(savedUri, values, null, null);

            } else {
                // Android 9 and below — write to DCIM/Dayboxd directly
                File dcimDir = new File(
                        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
                        "Dayboxd"
                );
                if (!dcimDir.exists()) {
                    dcimDir.mkdirs();
                }

                File destFile = new File(dcimDir, fileName);
                try (InputStream inputStream = new FileInputStream(sourceFile);
                     OutputStream outputStream = new java.io.FileOutputStream(destFile)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                }

                // Trigger media scanner so gallery app picks it up
                android.media.MediaScannerConnection.scanFile(
                        context,
                        new String[]{destFile.getAbsolutePath()},
                        new String[]{"image/png"},
                        null
                );

                savedUri = Uri.fromFile(destFile);
            }

            JSObject result = new JSObject();
            result.put("uri", savedUri.toString());
            result.put("fileName", fileName);
            call.resolve(result);

        } catch (IOException e) {
            call.reject("Failed to save image to gallery: " + e.getMessage(), e);
        } catch (Exception e) {
            call.reject("Unexpected error: " + e.getMessage(), e);
        }
    }
}
