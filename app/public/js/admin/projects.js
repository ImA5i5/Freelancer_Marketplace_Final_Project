// public/js/admin/projects.js

document.addEventListener("DOMContentLoaded", () => {
  attachEvents();

  document.getElementById("filterForm").addEventListener("submit", e => {
    e.preventDefault();
    loadPage(1);
  });
});

/* ================================================================
   LOAD PAGINATED TABLE (AJAX)
================================================================ */
async function loadPage(page = 1) {
  const status = document.getElementById("filterStatus").value;
  const search = document.getElementById("filterSearch").value;

  const query = new URLSearchParams({ page, status, search }).toString();

  const res = await fetch(`/project/admin/projects/ajax?${query}`, {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });

  // SESSION EXPIRED
  if (res.status === 401) {
    Swal.fire("Session Expired", "Please log in again.", "warning");
    return (window.location.href = "/auth/login");
  }

  const html = await res.text();

  document.getElementById("projectTableContainer").innerHTML = html;

  attachEvents();
}

/* ================================================================
   REATTACH ALL EVENT HANDLERS AFTER AJAX LOAD
================================================================ */
function attachEvents() {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
  });

  /* ------------------------------------------------------------
     PAGINATION BUTTONS
  ------------------------------------------------------------ */
  document.querySelectorAll(".pagination-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      loadPage(btn.dataset.page);
    });
  });

  /* ------------------------------------------------------------
     APPROVE PROJECT
  ------------------------------------------------------------ */
  document.querySelectorAll(".approveBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const confirm = await Swal.fire({
        title: "Approve this project?",
        icon: "question",
        showCancelButton: true
      });

      if (!confirm.isConfirmed) return;

      const res = await fetch(`/project/admin/projects/${id}/approve`, {
        method: "PUT",
        headers: { "X-Requested-With": "XMLHttpRequest" }
      });

      if (res.status === 401) {
        Swal.fire("Session Expired", "Please log in again.", "warning");
        return (window.location.href = "/auth/login");
      }

      const data = await res.json();

      if (data.success) {
        Toast.fire({ icon: "success", title: "Project Approved!" });
        loadPage();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    });
  });

  /* ------------------------------------------------------------
     REJECT PROJECT
  ------------------------------------------------------------ */
  document.querySelectorAll(".rejectBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const confirm = await Swal.fire({
        title: "Reject this project?",
        icon: "warning",
        showCancelButton: true
      });

      if (!confirm.isConfirmed) return;

      const res = await fetch(`/project/admin/projects/${id}/reject`, {
        method: "PUT",
        headers: { "X-Requested-With": "XMLHttpRequest" }
      });

      if (res.status === 401) {
        Swal.fire("Session Expired", "Please log in again.", "warning");
        return (window.location.href = "/auth/login");
      }

      const data = await res.json();

      if (data.success) {
        Toast.fire({ icon: "success", title: "Project Rejected!" });
        loadPage();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    });
  });

  /* ------------------------------------------------------------
     TOGGLE VISIBILITY
  ------------------------------------------------------------ */
  document.querySelectorAll(".toggleVisibilityBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const res = await fetch(`/project/admin/projects/${id}/visibility`, {
        method: "PATCH",
        headers: { "X-Requested-With": "XMLHttpRequest" }
      });

      if (res.status === 401) {
        Swal.fire("Session Expired", "Please log in again.", "warning");
        return (window.location.href = "/auth/login");
      }

      const data = await res.json();

      if (data.success) {
        Toast.fire({ icon: "success", title: "Visibility Updated!" });
        loadPage();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    });
  });
}
