package college.libs;

import java.awt.Dimension;
import java.awt.Rectangle;
import javax.swing.JFrame;

/*
 * ApplicationWindow
 *
 * Shared base class for all Swing windows.
 * - Enforces minimum window size
 * - Remembers window size & position between screens
 *
 * Does NOT touch UI components or layouts.
 */
public abstract class ApplicationWindow extends JFrame {

    // Global minimum size
    private static final int MIN_WIDTH = 1000;
    private static final int MIN_HEIGHT = 800;

    // Shared window bounds across the app
    private static Rectangle lastBounds;

    protected ApplicationWindow() {
        super();

        // Enforce minimum size (safe, OS-level)
        setMinimumSize(new Dimension(MIN_WIDTH, MIN_HEIGHT));
        setResizable(true);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Reuse last window size & position if available
        if (lastBounds != null) {
            setBounds(lastBounds);
        }
    }

    @Override
    public void dispose() {
        // Remember size & position before closing
        lastBounds = getBounds();
        super.dispose();
    }
}
