package college.libs;

import java.awt.Dimension;
import java.awt.Rectangle;
import javax.swing.JFrame;

/*
 * ApplicationWindow
 *
 * Centralized window behavior for the entire app.
 * - Enforces minimum size
 * - Preserves size & position between windows
 */
public abstract class ApplicationWindow extends JFrame {

    private static final int MIN_WIDTH = 1000;
    private static final int MIN_HEIGHT = 800;

    // Shared window state
    private static Rectangle lastBounds;

    protected ApplicationWindow() {
        super();

        setMinimumSize(new Dimension(MIN_WIDTH, MIN_HEIGHT));
        setResizable(true);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Apply last known bounds (if any)
        if (lastBounds != null) {
            setBounds(lastBounds);
        }
    }

    /**
     * Must be called BEFORE opening another window
     */
    public void rememberBounds() {
        lastBounds = getBounds();
    }
}
