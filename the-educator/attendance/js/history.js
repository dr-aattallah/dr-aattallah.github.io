const SUPABASE_URL =
"https://obgmbgsgwxbenglltcwv.supabase.co";

const SUPABASE_KEY =
"ضع نفس مفتاح ANON المستخدم في checkin.js";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const params =
new URLSearchParams(window.location.search);

const studentId =
params.get("student");

loadAttendance();

async function loadAttendance() {

    try {

        const { data, error } =
        await supabaseClient.rpc(
            "get_student_attendance",
            {
                p_student_id: studentId
            }
        );

        if (error) throw error;

        renderData(data);

    }

    catch(err) {

        console.error(err);

    }

}

function renderData(rows) {

    document.getElementById(
        "studentId"
    ).textContent = studentId;

    document.getElementById(
        "totalAttendance"
    ).textContent = rows.length;

    document.getElementById(
        "attendanceRate"
    ).textContent = "100%";

    const table =
    document.getElementById(
        "attendanceTable"
    );

    rows.forEach(row => {

        const tr =
        document.createElement("tr");

        const date =
        new Date(
            row.attendance_time
        );

        tr.innerHTML = `
            <td>${row.course_code}</td>
            <td>${date.toLocaleDateString('ar-SA')}</td>
            <td>${date.toLocaleTimeString('ar-SA')}</td>
            <td>${row.status}</td>
        `;

        table.appendChild(tr);

    });

}
