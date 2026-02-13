package college.libs;

import java.awt.Dimension;
import java.awt.Rectangle;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;

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
    private static Rectangle sharedBounds;

    protected ApplicationWindow() {
        super();

        setMinimumSize(new Dimension(MIN_WIDTH, MIN_HEIGHT));
        setResizable(true);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        if (sharedBounds != null) {
            setBounds(sharedBounds);
        } else {
            setSize(MIN_WIDTH, MIN_HEIGHT);
            setLocationRelativeTo(null);
        }

        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentMoved(ComponentEvent e) {
                sharedBounds = getBounds();
            }

            @Override
            public void componentResized(ComponentEvent e) {
                sharedBounds = getBounds();
            }
        });
    }
}
