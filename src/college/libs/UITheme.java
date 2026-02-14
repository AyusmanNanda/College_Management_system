package college.libs;

import java.awt.*;

/**
 * UITheme defines the color palette and visual identity
 * for the College Management System.
 *
 * This file will act as the foundation for future UI modernization.
 */
public class UITheme {

    // Primary blue color for headers, buttons, accents
    public static final Color PRIMARY_BLUE = new Color(33, 150, 243);

    // Darker blue for hover or emphasis
    public static final Color PRIMARY_BLUE_DARK = new Color(25, 118, 210);

    // Light background color for content areas
    public static final Color BACKGROUND_LIGHT = Color.WHITE;

    // Neutral text color
    public static final Color TEXT_PRIMARY = new Color(33, 33, 33);

    private UITheme() {
        // Prevent instantiation
    }
}
