package college.libs;

import java.awt.*;

/**
 * UITheme defines the official visual identity
 * of the College Management System.
 *
 * This is aligned with LoginPageFrame.
 */
public class UITheme {

    // Official CMS theme blue (from LoginPageFrame)
    public static final Color PRIMARY_BLUE = new Color(39, 71, 122);

    // White background used in login
    public static final Color BACKGROUND_WHITE = Color.WHITE;

    // Primary text color
    public static final Color TEXT_WHITE = Color.WHITE;

    // Header font used in LoginPageFrame
    public static final Font HEADER_FONT =
            new Font("Segoe UI", Font.BOLD, 22);

    private UITheme() {
        // Prevent instantiation
    }
}
