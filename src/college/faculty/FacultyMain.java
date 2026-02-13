package college.faculty;

import college.libs.ApplicationWindow;

import java.awt.Color;
import java.awt.Font;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;

import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;

/*
 * Temporary Admin main screen.
 * Shows "Hello Admin".
 */
public class FacultyMain extends ApplicationWindow {

    private JPanel contentPane;
    private JLabel titleLabel;

    public FacultyMain() {

        setTitle("Faculty Panel");

        contentPane = new JPanel(null);
        contentPane.setBackground(Color.WHITE);
        setContentPane(contentPane);

        titleLabel = new JLabel("Hello Faculty");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 32));
        titleLabel.setForeground(new Color(39, 71, 122));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        contentPane.add(titleLabel);

        // Keep label centered on resize (layout only)
        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                updateLayout();
            }
        });
    }

    private void updateLayout() {
        int width = getWidth();
        int height = getHeight();
        titleLabel.setBounds(0, height / 2 - 20, width, 40);
    }
}
