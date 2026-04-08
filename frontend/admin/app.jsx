const { useEffect, useState } = React;

const emptyForm = {
  id: null,
  name: "",
  note: "",
  coverImage: null,
  scare: false,
  cardImage: null,
  videoFile: null,
  keepCover: true,
  keepVideo: true
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [adminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "null");
    } catch (error) {
      return null;
    }
  });
  const [items, setItems] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState("Đang sẵn sàng.");
  const [loading, setLoading] = useState(false);

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Yêu cầu thất bại");
    }
    return payload.data;
  }

  async function loadItems() {
    if (!token) return;
    setLoading(true);

    try {
      const data = await api("/api/admin/cards");
      setItems(data);
      setFeedback("Đã tải danh sách thiệp.");
    } catch (error) {
      setFeedback(error.message);
      if (error.message.toLowerCase().includes("token") || error.message.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setToken("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadWishes() {
    if (!token) return;

    try {
      const data = await api("/api/admin/wishes");
      setWishes(data);
    } catch (error) {
      setFeedback(error.message);
      if (error.message.toLowerCase().includes("token") || error.message.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setToken("");
      }
    }
  }

  useEffect(() => {
    loadItems();
    loadWishes();
  }, [token]);

  function resetForm() {
    setForm(emptyForm);
  }

  function startEdit(item) {
    setForm({
      id: item.id,
      name: item.name,
      note: item.note || "",
      coverImage: null,
      scare: item.scare,
      cardImage: null,
      videoFile: null,
      keepCover: Boolean(item.coverImage),
      keepVideo: Boolean(item.videoUrl)
    });
    setFeedback(`Đang sửa thiệp của ${item.name}.`);
  }

  function buildFormData() {
    const data = new FormData();
    data.append("name", form.name);
    data.append("note", form.note);
    data.append("scare", String(form.scare));
    data.append("keepCover", String(form.keepCover));
    data.append("keepVideo", String(form.keepVideo));

    if (form.coverImage) {
      data.append("coverImage", form.coverImage);
    }
    if (form.cardImage) {
      data.append("cardImage", form.cardImage);
    }
    if (form.videoFile) {
      data.append("videoFile", form.videoFile);
    }

    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setFeedback("Vui lòng nhập tên người nhận.");
      return;
    }

    if (!form.id && !form.cardImage) {
      setFeedback("Thiệp mới cần ảnh bìa.");
      return;
    }

    setLoading(true);
    setFeedback(form.id ? "Đang cập nhật thiệp..." : "Đang tạo thiệp...");

    try {
      const method = form.id ? "PUT" : "POST";
      const path = form.id ? `/api/admin/cards/${form.id}` : "/api/admin/cards";

      await api(path, {
        method,
        body: buildFormData()
      });

      resetForm();
      await loadItems();
      await loadWishes();
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Bạn chắc chắn muốn xóa thiệp này?");
    if (!confirmed) return;

    setLoading(true);
    setFeedback("Đang xóa thiệp...");

    try {
      await api(`/api/admin/cards/${id}`, { method: "DELETE" });
      if (form.id === id) {
        resetForm();
      }
      await loadItems();
      await loadWishes();
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyLink(item) {
    const absoluteUrl = `${window.location.origin}${item.publicUrl || `/card.html?name=${encodeURIComponent(item.name)}`}`;

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setFeedback(`Da copy link cho ${item.name}.`);
    } catch (error) {
      setFeedback(`Khong copy duoc. Link: ${absoluteUrl}`);
    }
  }

  async function copyLookupLink() {
    const owner = adminUser?.username;
    const absoluteUrl = owner
      ? `${window.location.origin}/?owner=${encodeURIComponent(owner)}`
      : `${window.location.origin}/`;

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setFeedback("Da copy link trang nhap ten cua tai khoan nay.");
    } catch (error) {
      setFeedback(`Khong copy duoc. Link: ${absoluteUrl}`);
    }
  }

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken("");
    window.location.href = "/";
  }

  if (!token) {
    return (
      <main className="admin-app">
        <section className="panel form-panel">
          <p className="feedback">
            Chưa có token đăng nhập. Hãy quay lại trang chủ và đăng nhập bằng tài khoản admin.
          </p>
          <button className="primary-button" onClick={() => (window.location.href = "/")}>
            Về trang chủ
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-app">
      <section className="hero">
        <div>
          <p>Admin Dashboard</p>
          <p>{adminUser?.username ? `Tai khoan: ${adminUser.username}` : "Moi tai khoan chi thay thiep cua minh."}</p>
          <button className="secondary-button" type="button" onClick={copyLookupLink}>
            Copy link nhap ten
          </button>
          <h1>Quản lý thiệp tốt nghiệp</h1>
        </div>
        <button className="logout-button" onClick={logout}>
          Đăng xuất
        </button>
      </section>

      <section className="panel form-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Tên người nhận</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Ví dụ: Nguyen Van A"
            />
          </div>

          <div className="field">
            <label>Note hien tren thiep</label>
            <textarea
              rows="5"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="Nhap loi nhan se hien ben trong thiep"
            />
          </div>

          <div className="field">
            <label>Ảnh bìa (tùy chọn)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setForm({ ...form, coverImage: event.target.files[0] || null })}
            />
          </div>

          <div className="field">
            <label>Ảnh thiệp</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setForm({ ...form, cardImage: event.target.files[0] || null })}
            />
          </div>

          <div className="field">
            <label>Video scare</label>
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setForm({ ...form, videoFile: event.target.files[0] || null })}
            />
          </div>

          <div className="field">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.keepCover}
                onChange={(event) => setForm({ ...form, keepCover: event.target.checked })}
              />
              Giữ bìa hiện tại
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.scare}
                onChange={(event) => setForm({ ...form, scare: event.target.checked })}
              />
              Bật scare mode
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.keepVideo}
                onChange={(event) => setForm({ ...form, keepVideo: event.target.checked })}
              />
              Giữ video hiện tại
            </label>
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              {form.id ? "Cập nhật" : "Thêm mới"}
            </button>
            <button className="secondary-button" type="button" onClick={resetForm}>
              Làm mới form
            </button>
          </div>
        </form>
        <p className="feedback">{feedback}</p>
      </section>

      <section className="panel table-shell">
        {items.length ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Người nhận</th>
                <th>Ảnh</th>
                <th>Bìa</th>
                <th>Scare</th>
                <th>Video</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    <img className="thumb" src={item.cardImage} alt={item.name} />
                  </td>
                  <td>{item.coverImage ? "Có" : "Tự tạo"}</td>
                  <td>{item.scare ? "On" : "Off"}</td>
                  <td>{item.videoUrl ? "Có" : "Không"}</td>
                  <td>
                    <div className="table-actions">
                      <button className="secondary-button" onClick={() => copyLink(item)}>
                        Copy link
                      </button>
                      <button className="secondary-button" onClick={() => startEdit(item)}>
                        Sửa
                      </button>
                      <button className="danger-button" onClick={() => handleDelete(item.id)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>{loading ? "Đang tải..." : "Chưa có thiệp nào trong hệ thống."}</p>
          </div>
        )}
      </section>

      <section className="panel table-shell">
        <h2>Loi chuc da nhan</h2>
        {wishes.length ? (
          <table>
            <thead>
              <tr>
                <th>Thiep</th>
                <th>Nguoi gui</th>
                <th>Loi nhan</th>
                <th>Anh</th>
                <th>Video</th>
                <th>Thoi gian</th>
              </tr>
            </thead>
            <tbody>
              {wishes.map((wish) => (
                <tr key={wish.id}>
                  <td>{wish.invitationName || `#${wish.invitationId}`}</td>
                  <td>{wish.senderName || "An danh"}</td>
                  <td>{wish.message || "Khong co text"}</td>
                  <td>
                    {wish.imageUrl ? (
                      <a className="secondary-button" href={wish.imageUrl} target="_blank" rel="noreferrer">
                        Xem anh
                      </a>
                    ) : (
                      "Khong"
                    )}
                  </td>
                  <td>
                    {wish.videoUrl ? (
                      <a className="secondary-button" href={wish.videoUrl} target="_blank" rel="noreferrer">
                        Xem video
                      </a>
                    ) : (
                      "Khong"
                    )}
                  </td>
                  <td>{new Date(wish.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Chua co loi chuc nao duoc gui.</p>
          </div>
        )}
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
