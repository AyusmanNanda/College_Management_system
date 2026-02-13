package college.student;

import college.libs.ApplicationWindow;

import javax.swing.JLabel;
import javax.swing.SwingConstants;
import java.awt.Color;
import java.awt.Font;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import javax.swing.JPanel;

/*
 * Temporary Student main screen.
 * Shows "Hello Student".
 */
public class StudentMain extends ApplicationWindow {

    private JPanel contentPane;
    private JLabel titleLabel;

    public StudentMain() {

        setTitle("Student Dashboard");

        contentPane = new JPanel(null);
        contentPane.setBackground(Color.WHITE);
        setContentPane(contentPane);

        titleLabel = new JLabel("Welcome Student");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 32));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        contentPane.add(titleLabel);

        updateLayout();

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
