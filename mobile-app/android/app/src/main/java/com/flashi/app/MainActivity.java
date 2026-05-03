package com.flashi.app;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /**
     * Handle the Android hardware back button:
     * - If the WebView can go back in history, navigate back.
     * - Otherwise, let the default behavior close the app.
     * This ensures users can return to the previous page after navigating
     * within the app (e.g., from a product page back to search results).
     */
    @Override
    public void onBackPressed() {
        WebView webView = getBridge().getWebView();
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
