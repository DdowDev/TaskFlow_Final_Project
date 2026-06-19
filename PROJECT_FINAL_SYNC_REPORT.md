# PROJECT_FINAL_SYNC_REPORT

Tên đề tài: **XÂY DỰNG HỆ THỐNG QUẢN LÝ CÔNG VIỆC THEO MÔ HÌNH KANBAN TÍCH HỢP AI HỖ TRỢ QUẢN LÝ VÀ PHÂN TÍCH CÔNG VIỆC**

> Báo cáo này được tổng hợp từ source code hiện tại trong hai thư mục `final-full-stack-mern-advanced-web` và `final-full-stack-mern-advanced-api`. Nội dung ưu tiên phản ánh đúng chức năng đang có trong code; các mục chưa chắc chắn được ghi là **cần kiểm tra demo**.

## 1. Tổng quan project

Project TaskFlow gồm hai phần chính:

| Phần | Thư mục | Vai trò |
|---|---|---|
| Frontend | `final-full-stack-mern-advanced-web` | Giao diện React/Vite cho người dùng, board Kanban, dashboard, card modal, admin console, AI UI |
| Backend | `final-full-stack-mern-advanced-api` | REST API Express/Node.js, MongoDB native driver, xác thực, phân quyền, board/card/checklist/comment, dashboard, AI, admin |

Kiến trúc tổng quan:

- Frontend gọi backend qua Axios helper trong `src/apis/index.js`.
- Backend tổ chức theo route/controller/service/model.
- Dữ liệu lưu bằng MongoDB native driver, chưa thấy Mongoose.
- Xác thực dùng JWT qua cookie `accessToken` và `refreshToken`.
- Upload ảnh dùng Cloudinary.
- Email xác thực/invitation dùng Brevo.
- AI Assistant dùng backend AI module, có mock mode, real OpenAI provider và fallback rule-based.
- Socket.IO đang được dùng cho notification invitation board.

## 2. Công nghệ sử dụng

### Frontend

| Công nghệ/thư viện | Mục đích |
|---|---|
| React 18 | Xây dựng UI |
| Vite | Dev/build frontend |
| Material UI v5, Emotion | Component UI, theme, layout |
| Redux Toolkit, Redux Persist | State management và persist user |
| React Router DOM v6 | Routing |
| Axios | Gọi API |
| React Hook Form | Form |
| React Toastify | Toast notification |
| Recharts | Dashboard charts |
| dnd-kit | Drag-drop column/card |
| socket.io-client | Nhận notification realtime |
| `@uiw/react-md-editor` | Markdown editor cho card description |
| moment | Format thời gian |

### Backend

| Công nghệ/thư viện | Mục đích |
|---|---|
| Node.js, Express | REST API server |
| MongoDB native driver | Truy vấn database |
| Joi | Validation request |
| bcryptjs | Hash password |
| jsonwebtoken | JWT access/refresh token |
| cookie-parser, cors | Cookie/CORS |
| Cloudinary, multer | Upload avatar/card cover |
| Brevo SDK | Gửi email |
| socket.io | Realtime invitation notification |
| OpenAI SDK | Gọi GPT-4o mini cho AI Assistant |
| uuid | Verify token |
| Babel | Build/transpile backend |

## 3. Cấu trúc thư mục

### Backend

| Thư mục/file | Vai trò |
|---|---|
| `src/routes/v1` | Định nghĩa API routes: user, board, column, card, invitation, admin, ai |
| `src/controllers` | Controller nhận request/response |
| `src/services` | Business logic |
| `src/models` | MongoDB model/data access |
| `src/validations` | Joi validation |
| `src/middlewares` | Auth, upload, error handling |
| `src/providers` | JWT, Cloudinary, Brevo, AI/OpenAI provider |
| `src/utils` | Constants, permissions, fallback rules, formatter |
| `src/sockets` | Socket.IO invitation event |
| `src/config` | Environment, CORS, MongoDB |

### Frontend

| Thư mục/file | Vai trò |
|---|---|
| `src/pages/Auth` | Login/Register/Verify |
| `src/pages/Boards` | Board list, board detail, dashboard, BoardBar, Kanban |
| `src/components/Modal/ActiveCard` | Card detail modal, checklist, comment/activity, AI checklist |
| `src/components/AppBar` | Header/app navigation |
| `src/pages/Admin` | Admin console/dashboard/users/boards |
| `src/redux` | User, active board, active card, notification state |
| `src/apis/index.js` | API helpers |
| `src/utils` | Axios instance, socket client, validators, formatter |

## 4. Danh sách chức năng thực tế

### Authentication / User

| Chức năng | Trạng thái | Frontend | Backend/API | Model |
|---|---|---|---|---|
| Đăng ký tài khoản | Hoàn thiện | `pages/Auth/Register` | `POST /v1/users/register` | `users` |
| Xác thực email | Hoàn thiện | `pages/Auth/AccountVerification` | `PUT /v1/users/verify` | `users.verifyToken` |
| Đăng nhập | Hoàn thiện | `pages/Auth/Login` | `POST /v1/users/login` | `users` |
| Refresh token | Hoàn thiện | Axios interceptor | `GET /v1/users/refresh_token` | JWT cookie |
| Đăng xuất | Hoàn thiện | App/profile menu | `DELETE /v1/users/logout` | Cookie |
| Cập nhật profile/avatar/password | Hoàn thiện | Settings/Account | `PUT /v1/users/update` | `users`, Cloudinary |
| Chặn user inactive/blocked | Có backend + admin UI block/unblock | Admin Users | `PUT /v1/admin/users/:id/status` | `users.isActive/isBlocked` |

### Board / Kanban

| Chức năng | Trạng thái | Frontend | Backend/API | Ghi chú |
|---|---|---|---|---|
| Danh sách board | Hoàn thiện | `pages/Boards/index.jsx` | `GET /v1/boards` | Lọc board owner/member |
| Tạo board | Hoàn thiện | `pages/Boards/create.jsx` | `POST /v1/boards` | Có title, description, type |
| Xem board detail | Hoàn thiện | `pages/Boards/_id.jsx` | `GET /v1/boards/:id` | Load columns/cards/members |
| Board Settings read-only | Hoàn thiện | `BoardBar`/dialog | Dùng board detail | Hiển thị owners/members/metadata |
| Edit board metadata | Hoàn thiện | Board Settings | `PUT /v1/boards/:id` | Owner only |
| Remove/kick member | Hoàn thiện | Board Settings | `DELETE /v1/boards/:id/members/:memberId` | Pull khỏi board và cards |
| Board dashboard view | Hoàn thiện | `BoardDashboard` | `GET /v1/boards/:id/dashboard` | Board-level statistics |
| Archive/Delete board | Chưa thấy | - | - | Không nên ghi đã có |

### Column

| Chức năng | Trạng thái | Frontend | Backend/API | Quyền |
|---|---|---|---|---|
| Tạo column | Hoàn thiện | BoardContent/Column UI | `POST /v1/columns` | Board Owner |
| Sửa title column | Hoàn thiện | Column UI | `PUT /v1/columns/:id` | Board Owner |
| Xóa column | Hoàn thiện | Column menu | `DELETE /v1/columns/:id` | Board Owner |
| Sắp xếp column drag-drop | Hoàn thiện | dnd-kit | `PUT /v1/boards/:id` với `columnOrderIds` | Board Owner |

### Card / Task

| Chức năng | Trạng thái | Frontend | Backend/API | Ghi chú |
|---|---|---|---|---|
| Tạo card | Hoàn thiện | Column add card | `POST /v1/cards` | Owner/member |
| Xem card modal | Hoàn thiện | `ActiveCard.jsx` | Dữ liệu từ board detail | Modal card detail |
| Cập nhật title/description | Hoàn thiện | ActiveCard | `PUT /v1/cards/:id` | Markdown description |
| Status/Priority/Dates | Hoàn thiện | ActiveCard + Card preview | `PUT /v1/cards/:id` | TODO/IN_PROGRESS/IN_REVIEW/DONE/CANCELLED; LOW/MEDIUM/HIGH/URGENT |
| Mark complete | Hoàn thiện | ActiveCard title area | `PUT /v1/cards/:id` | Toggle DONE/TODO |
| Card cover | Hoàn thiện | ActiveCard | `PUT /v1/cards/:id` multipart `cardCover` | Cloudinary |
| Join/Leave member card | Hoàn thiện | ActiveCard sidebar | `PUT /v1/cards/:id` | Update card.memberIds |
| Drag-drop card | Hoàn thiện | BoardContent dnd-kit | `PUT /v1/cards/:id`, `PUT /v1/boards/supports/moving_card` | Same/different column |
| Archive card | Chưa hoàn thiện | - | Chưa thấy route riêng | Activity enum có sẵn nhưng flow chưa có |

### Checklist / Subtask

| Chức năng | Trạng thái | Frontend | Backend/API | Ghi chú |
|---|---|---|---|---|
| Nhiều checklist/card | Hoàn thiện | `CardChecklistSection.jsx` | `PUT /v1/cards/:id` `checklistToAdd` | Tối đa 5 checklist/card |
| Rename/delete checklist | Hoàn thiện | CardChecklistSection | `checklistToRename`, `checklistToDelete` | Embedded trong card |
| Add/toggle/delete item | Hoàn thiện | CardChecklistSection | `checklistItemToAdd/Toggle/Delete` | Tối đa 20 item/checklist |
| Rename item | Hoàn thiện | CardChecklistSection | `checklistItemToRename` |  |
| AI checklist suggestion | Hoàn thiện frontend/backend | `AiChecklistSuggestionDialog.jsx` | `POST /v1/ai/cards/:cardId/checklist-suggestions` | Không tự động apply |
| Apply AI checklist | Hoàn thiện frontend | AiChecklist dialog | Tuần tự gọi `PUT /v1/cards/:id` | Không có bulk endpoint |

### Comment / Activity

| Chức năng | Trạng thái | Frontend | Backend/API | Ghi chú |
|---|---|---|---|---|
| Comment card | Hoàn thiện | `CardActivitySection.jsx` | `PUT /v1/cards/:id` `commentToAdd` | Comment embedded trong card |
| Activity log collection | Hoàn thiện | System Log tab | `GET /v1/cards/:id/activities` | Collection riêng `activityLogs` |
| Log tự động card actions | Một phần tốt | Backend services | Service tự ghi log | Có fallback nếu log lỗi |
| Pagination comments/system log | Có UI phân trang | CardActivitySection | Activity API phân trang | Comment phân trang frontend từ embedded comments |

### Member / Invitation

| Chức năng | Trạng thái | Frontend | Backend/API | Ghi chú |
|---|---|---|---|---|
| Invite member vào board | Hoàn thiện | BoardBar invite | `POST /v1/invitations/board` | Owner only |
| Danh sách notification invitation | Hoàn thiện | Notifications menu | `GET /v1/invitations` | Invitation notification |
| Accept/reject invitation | Hoàn thiện | Notifications menu | `PUT /v1/invitations/board/:invitationId` | Thêm memberIds khi accepted |
| Socket invitation event | Có | `socketClient`, Notifications | Socket.IO | Cần kiểm tra demo realtime |
| Remove member khỏi board | Hoàn thiện | Board Settings | `DELETE /v1/boards/:id/members/:memberId` | Không xóa user/comment/log |

### Permission / Role

| Vai trò | Có trong code | Ghi chú |
|---|---|---|
| Guest | Có | Chỉ register/login/verify, không truy cập API protected |
| User | Có | User đăng nhập thường |
| Board Owner | Có | `board.ownerIds` |
| Board Member | Có | `board.memberIds` |
| System Admin | Có | `user.role === 'system_admin'`; backend cũng còn hỗ trợ legacy `admin` |

### Notification

- Notification hiện chủ yếu là **board invitation notification**.
- Có Redux notification state và socket event cho invitation.
- Chưa thấy collection `notifications` riêng.
- Không nên ghi báo cáo là hệ thống notification tổng quát cho mọi activity nếu chưa demo được.

### Dashboard / Statistics

| Dashboard | Trạng thái | File/API | Nội dung |
|---|---|---|---|
| Board Dashboard | Hoàn thiện | `BoardDashboard.jsx`, `GET /v1/boards/:id/dashboard` | KPI, charts, overdue/due soon, workload, AI analysis |
| Admin Dashboard | Hoàn thiện | `Admin/Dashboard`, `GET /v1/admin/dashboard` | Total users, active/blocked users, boards, cards, charts |

### AI

| Chức năng AI | Trạng thái | Frontend | Backend |
|---|---|---|---|
| AI phân tích board | Hoàn thiện | `AiAssistantPanel.jsx` | `POST /v1/ai/boards/:boardId/analysis` |
| AI gợi ý checklist cho card | Hoàn thiện | `AiChecklistSuggestionDialog.jsx` | `POST /v1/ai/cards/:cardId/checklist-suggestions` |
| AI real provider OpenAI | Có | Không gọi trực tiếp từ frontend | `aiProvider.js`, OpenAI SDK |
| Mock/fallback | Có | Frontend hiển thị mode | `aiFallbackRules.js` |
| Lưu kết quả AI vào DB | Không | - | Kết quả trả trực tiếp, không persist |

### Search / Filter

| Chức năng | Trạng thái | File | Ghi chú |
|---|---|---|---|
| Search card title | Hoàn thiện | `BoardFilterPanel`, `_id.jsx` | Frontend filter |
| Filter status/priority | Hoàn thiện | `_id.jsx` | Logic AND |
| Filter overdue/due soon | Hoàn thiện | `_id.jsx` | Loại trừ DONE/CANCELLED |
| Assigned to me | Hoàn thiện | `_id.jsx` | Dựa vào `card.memberIds` |
| Filter member từ workload | Hoàn thiện | `WorkSection`, `_id.jsx` | Query param `filterMember`, scroll card |
| Disable DnD khi filter active | Hoàn thiện | BoardContent/Column/Card | Tránh reorder sai |

### Upload ảnh/file

| Upload | Trạng thái | Backend | Ghi chú |
|---|---|---|---|
| Avatar user | Hoàn thiện | `PUT /v1/users/update` | Cloudinary |
| Card cover | Hoàn thiện | `PUT /v1/cards/:id` | Cloudinary |
| Attachment file card | Chưa hoàn thiện | - | UI Coming soon |

### Realtime / Socket

- Backend có Socket.IO server.
- Frontend có `socket.io-client`.
- Socket hiện dùng cho invitation notification.
- Chưa thấy realtime sync board/card drag-drop hoặc activity log.

## 5. Danh sách API backend

| Method | Endpoint | Route/controller | Mục đích | Auth | Quyền | Body chính | Model liên quan |
|---|---|---|---|---|---|---|---|
| GET | `/v1/status` | `index.js` | Health check | Không | - | - | - |
| POST | `/v1/users/register` | `userRoute/userController` | Đăng ký | Không | - | email, password, username/displayName | users |
| PUT | `/v1/users/verify` | `userRoute/userController` | Verify email | Không | - | email, token | users |
| POST | `/v1/users/login` | `userRoute/userController` | Đăng nhập | Không | - | email, password | users |
| DELETE | `/v1/users/logout` | `userRoute/userController` | Đăng xuất | Không/Token cookie | - | - | cookies |
| GET | `/v1/users/refresh_token` | `userRoute/userController` | Refresh access token | Refresh cookie | - | - | users/JWT |
| PUT | `/v1/users/update` | `userRoute/userController` | Cập nhật profile | Có | Current user | displayName, password, avatar | users |
| GET | `/v1/boards` | `boardRoute/boardController` | Lấy danh sách board | Có | Owner/member | query page/itemsPerPage/q | boards |
| POST | `/v1/boards` | `boardRoute/boardController` | Tạo board | Có | User | title, description, type | boards |
| GET | `/v1/boards/:id` | `boardRoute/boardController` | Chi tiết board | Có | Owner/member | - | boards, columns, cards, users |
| PUT | `/v1/boards/:id` | `boardRoute/boardController` | Update board metadata/order | Có | Owner | title, description, type, columnOrderIds | boards |
| GET | `/v1/boards/:id/dashboard` | `boardRoute/boardController` | Board dashboard | Có | Owner/member | - | cards, users |
| DELETE | `/v1/boards/:id/members/:memberId` | `boardRoute/boardController` | Remove member khỏi board | Có | Owner | params boardId/memberId | boards, cards |
| PUT | `/v1/boards/supports/moving_card` | `boardRoute/boardController` | Move card khác column | Có | Owner/member | card/current/next column order | boards, columns, cards |
| POST | `/v1/columns` | `columnRoute/columnController` | Tạo column | Có | Owner | boardId, title | columns, boards |
| PUT | `/v1/columns/:id` | `columnRoute/columnController` | Sửa column | Có | Owner | title/cardOrderIds | columns |
| DELETE | `/v1/columns/:id` | `columnRoute/columnController` | Xóa column | Có | Owner | - | columns, cards |
| POST | `/v1/cards` | `cardRoute/cardController` | Tạo card | Có | Owner/member | boardId, columnId, title | cards, columns |
| PUT | `/v1/cards/:id` | `cardRoute/cardController` | Update card/action | Có | Owner/member | title, status, priority, dates, checklist actions, comment, cover | cards, activityLogs |
| GET | `/v1/cards/:id/activities` | `cardRoute/activityLogController` | Lấy system logs card | Có | Owner/member | query page/itemsPerPage | activityLogs |
| POST | `/v1/invitations/board` | `invitationRoute/invitationController` | Invite board member | Có | Owner | inviteeEmail, boardId | invitations, boards, users |
| GET | `/v1/invitations` | `invitationRoute/invitationController` | Danh sách invitation của user | Có | Current user | - | invitations |
| PUT | `/v1/invitations/board/:invitationId` | `invitationRoute/invitationController` | Accept/reject invitation | Có | Invitee | status | invitations, boards |
| GET | `/v1/admin/users` | `adminRoute/adminController` | Admin list users | Có | System Admin | query | users |
| GET | `/v1/admin/users/:id` | `adminRoute/adminController` | Admin user detail | Có | System Admin | - | users |
| PUT | `/v1/admin/users/:id/status` | `adminRoute/adminController` | Block/unblock user | Có | System Admin | isActive/isBlocked/reason | users |
| PUT | `/v1/admin/users/:id/role` | `adminRoute/adminController` | Update role | Có | System Admin | role | users |
| GET | `/v1/admin/boards` | `adminRoute/adminController` | Admin list boards | Có | System Admin | query | boards |
| GET | `/v1/admin/dashboard` | `adminRoute/adminController` | Admin dashboard | Có | System Admin | - | users, boards, cards |
| POST | `/v1/ai/boards/:boardId/analysis` | `aiRoute/aiController` | AI phân tích board | Có | Owner/member | params boardId | boards, cards, users, OpenAI |
| POST | `/v1/ai/cards/:cardId/checklist-suggestions` | `aiRoute/aiController` | AI gợi ý checklist | Có | Owner/member | params cardId | cards, boards, OpenAI |

## 6. Database models / collections

| Collection | Field chính | Liên kết | Ghi chú |
|---|---|---|---|
| `users` | email, password, username, displayName, avatar, role, isActive, isBlocked, verifyToken, createdAt, updatedAt, `_destroy` | `_id` được tham chiếu bởi board/card/invitation/activity | Role gồm `user`, `system_admin`; backend còn hỗ trợ legacy `admin/client` |
| `boards` | title, slug, description, type, columnOrderIds, ownerIds, memberIds, createdAt, updatedAt, `_destroy` | ownerIds/memberIds -> users; columns/cards theo boardId | Board permission dựa vào ownerIds/memberIds |
| `columns` | boardId, title, cardOrderIds, createdAt, updatedAt, `_destroy` | boardId -> boards; cardOrderIds -> cards | Column order lưu ở board/column |
| `cards` | boardId, columnId, title, description, createdBy, status, priority, startDate, dueDate, completedAt, lastActivityAt, cover, memberIds, comments, checklists, createdAt, updatedAt, `_destroy` | boardId/columnId/users | Comment/checklist là embedded arrays |
| `invitations` | inviterId, inviteeId, type, boardInvitation.boardId/status, createdAt, updatedAt, `_destroy` | users, boards | Dùng cho notification invitation |
| `activityLogs` | boardId, cardId, actor snapshot, action, metadata, createdAt | boards, cards, users snapshot | Log nằm collection riêng |

Quan hệ chính:

- User có thể là owner/member của nhiều board.
- Board có nhiều column và card.
- Column có nhiều card thông qua `cardOrderIds`.
- Card có nhiều comment/checklist/member.
- Invitation liên kết inviter, invitee và board.
- ActivityLog liên kết board/card và lưu snapshot actor.

## 7. Phân quyền và vai trò người dùng

| Vai trò | Quyền chính | Backend check | Frontend check |
|---|---|---|---|
| Guest | Register, login, verify email | Route public | Public route |
| User thường | Tạo board, tham gia board, quản lý card nếu là owner/member | `isAuthorized` | ProtectedRoute |
| Board Owner | Update board, invite/remove member, quản lý column, xem dashboard/AI, quản lý card | `boardPermissions.isBoardOwner` | BoardBar/Column UI |
| Board Member | Xem board, update/move card, comment/checklist, xem dashboard/AI | `isBoardOwnerOrMember` | UI ẩn chức năng owner-only |
| System Admin | Admin console users/boards/dashboard | `requireSystemAdmin` | AdminRoute |

Điểm cần ghi cẩn thận:

- Hệ thống sử dụng cơ chế phân quyền Owner/Member để kiểm soát truy cập.
- Admin console có backend update role, nhưng UI hiện chủ yếu block/unblock user và xem board/dashboard. Cần kiểm tra demo nếu muốn trình bày role edit.
- Board Member không có quyền update board metadata hoặc remove member.
- Column management đang được siết Board Owner.

## 8. Dashboard

### Board Dashboard

API: `GET /v1/boards/:id/dashboard`.

Chỉ số đang có:

- `totalCards`
- `cardsByStatus`
- `cardsByPriority`
- `completedCards`
- `overdueCards`, `overdueCardsCount`
- `dueSoonCards`, `dueSoonCardsCount`
- `cardsWithoutDueDate`
- `averageChecklistProgress`
- `memberWorkload`

Frontend hiển thị:

- Header dashboard + refresh + updated time.
- KPI cards: total, completed, overdue, due soon, no due date, checklist average.
- AI Assistant panel.
- Donut/Pie chart theo status.
- Bar chart theo priority.
- Work sections: overdue cards, due soon cards, member workload.
- Drill-down:
  - KPI completed/overdue/due soon.
  - Chart status/priority.
  - Workload member -> query param `filterMember`, chuyển về Kanban và scroll card đầu tiên match.

### Admin Dashboard

API: `GET /v1/admin/dashboard`.

Hiển thị:

- Total Users
- Active Users
- Blocked Users
- Total Boards
- Total Cards
- User Status chart
- System Overview chart

## 9. AI integration

### File liên quan

Backend:

- `src/routes/v1/aiRoute.js`
- `src/controllers/aiController.js`
- `src/services/aiService.js`
- `src/providers/aiProvider.js`
- `src/utils/aiFallbackRules.js`
- `src/validations/aiValidation.js`
- `src/config/environment.js`

Frontend:

- `src/pages/Boards/BoardDashboard/BoardDashboard.jsx`
- `src/pages/Boards/BoardDashboard/components/AiAssistantPanel.jsx`
- `src/components/Modal/ActiveCard/AiChecklistSuggestionDialog.jsx`
- `src/components/Modal/ActiveCard/ActiveCard.jsx`
- `src/apis/index.js`

### AI dùng để làm gì

| AI use case | Endpoint | Input rút gọn | Output |
|---|---|---|---|
| AI phân tích board | `POST /v1/ai/boards/:boardId/analysis` | board info, dashboard metrics, workload, tối đa các card quan trọng | summary, risks, priorityRecommendations, workloadInsights, nextActions, analyzedCards, warnings |
| AI gợi ý checklist | `POST /v1/ai/cards/:cardId/checklist-suggestions` | title, description, status, priority, dueDate, checklist hiện có | checklistTitle, items title/reason, confidence, notes |

### Provider/mode

- `AI_MODE=mock`: trả dữ liệu mẫu/fallback ổn định để demo offline.
- `AI_MODE=real`: gọi OpenAI nếu `AI_PROVIDER=openai` và có `AI_API_KEY`.
- Model cấu hình trong env, mặc định/tài liệu hiện dùng `gpt-4o-mini`.
- Nếu thiếu key, timeout, quota lỗi, OpenAI lỗi hoặc JSON sai format thì fallback rule-based.
- Frontend không gọi OpenAI trực tiếp; API key chỉ nằm backend.

### Lưu trữ

- Kết quả AI **không lưu database**.
- Board AI analysis lưu trong state frontend trong phiên xem dashboard.
- Checklist AI apply sẽ tạo checklist thật bằng API card update, nhưng response AI gợi ý không lưu riêng.

Cách mô tả trong báo cáo:

- Nên ghi: “Hệ thống tích hợp AI Assistant ở backend, sử dụng OpenAI GPT-4o mini khi cấu hình real mode, đồng thời có mock/fallback rule-based để đảm bảo demo ổn định.”
- Không nên ghi: “AI tự động phân tích liên tục/realtime” vì hiện AI chỉ chạy khi người dùng bấm nút.

## 10. Admin system

Backend:

- `GET /v1/admin/dashboard`
- `GET /v1/admin/users`
- `GET /v1/admin/users/:id`
- `PUT /v1/admin/users/:id/status`
- `PUT /v1/admin/users/:id/role`
- `GET /v1/admin/boards`

Frontend:

- `src/pages/Admin/AdminLayout.jsx`
- `src/pages/Admin/Dashboard.jsx`
- `src/pages/Admin/Users.jsx`
- `src/pages/Admin/Boards.jsx`
- `src/routes/AdminRoute.jsx`

Chức năng có thể demo:

- Đăng nhập bằng tài khoản system admin.
- Xem dashboard hệ thống.
- Xem danh sách user.
- Block/unblock user.
- Xem danh sách board.

Cần kiểm tra demo:

- UI update role admin có thể chưa có hoặc chưa nổi bật dù backend có route.

## 11. Search / Filter / Drag-drop / Upload / Notification

### Search / Filter

- Filter frontend trong board detail, không cần API mới.
- Logic AND giữa search/status/priority/overdue/dueSoon/assignedToMe/memberId.
- Khi filter active, drag-drop bị disable để tránh reorder sai.
- Banner filter active hiển thị và có clear filter.
- Query param `filterMember` hỗ trợ drill-down workload -> Kanban.

### Drag-drop

- Dùng dnd-kit.
- Column drag-drop owner-only.
- Card drag-drop owner/member.
- Drag-drop bị disable khi filter active.

### Upload

- User avatar upload qua Cloudinary.
- Card cover upload qua Cloudinary.
- Attachment file chưa hoàn thiện.

### Notification / Socket

- Invitation notification có Redux state và socket event.
- Accept/reject invitation cập nhật board membership.
- Chưa thấy notification collection tổng quát.
- Chưa thấy realtime cập nhật board/card cho mọi user.

## 12. Các chức năng có thể demo

Nên demo theo thứ tự:

1. Register -> verify email -> login.
2. Tạo board, nhập title/description/type.
3. Board Settings: xem owner/member, edit board owner-only.
4. Invite member, member nhận notification và accept.
5. Owner remove member khỏi board.
6. Tạo/sửa/xóa column.
7. Tạo card, mở card modal.
8. Cập nhật status/priority/startDate/dueDate.
9. Add member vào card, join/leave card.
10. Upload card cover.
11. Comment và xem System Log.
12. Checklist: add/rename/delete checklist, add/toggle/delete/rename item.
13. AI gợi ý checklist và apply vào card.
14. Drag-drop card/column.
15. Board filter/search và drill-down dashboard -> Kanban.
16. Board Dashboard KPI/charts/workload.
17. AI phân tích board.
18. Admin dashboard/users/boards.

## 13. Các chức năng còn thiếu hoặc mới một phần

| Chức năng | Trạng thái | Ghi chú báo cáo |
|---|---|---|
| Archive/Delete board | Chưa thấy | Không ghi là đã có |
| Archive/Restore card | Chưa hoàn thiện | Có enum/log chuẩn bị nhưng chưa có flow UI/API rõ |
| Labels | Coming soon | Sidebar card có placeholder |
| Attachment | Coming soon | Chưa có upload attachment |
| Checklist bulk apply backend | Chưa có | Frontend apply tuần tự |
| My Work Dashboard | Chưa có | Chỉ có Board Dashboard và Admin Dashboard |
| Notification tổng quát | Một phần | Hiện chủ yếu invitation |
| Realtime board/card sync | Chưa thấy | Socket mới cho invitation |
| Public board access | Không có | Quyền truy cập hoàn toàn dựa trên cơ chế Owner/Member |
| AI auto background analysis | Chưa có | AI chỉ chạy khi user bấm |
| Lưu lịch sử kết quả AI | Chưa có | AI response không persist |

## 14. Những điểm báo cáo Word cần sửa để đồng bộ

- Nếu báo cáo đang ghi MongoDB/Mongoose thì sửa thành **MongoDB native driver**, trừ khi có phần khác ngoài source này dùng Mongoose.
- Nếu báo cáo ghi realtime toàn bộ Kanban thì sửa thành **Socket.IO cho invitation notification; realtime board/card sync là hướng phát triển**.
- Nếu báo cáo ghi notification tổng quát thì sửa thành **notification lời mời board**.
- Nếu báo cáo ghi upload file/attachment thì sửa thành **upload avatar và card cover**, attachment là hướng phát triển.
- Nếu báo cáo ghi archive/restore board/card thì chuyển sang hướng phát triển.
- Nếu báo cáo ghi AI tự động thì sửa thành **AI Assistant được gọi theo yêu cầu người dùng**.
- Nếu báo cáo ghi AI lưu kết quả vào database thì sửa lại: **AI trả kết quả trực tiếp; không lưu DB**.
- Báo cáo không đề cập đến public board; quyền truy cập board hoàn toàn dựa trên cơ chế Owner/Member.
- Nếu báo cáo ghi Admin có đầy đủ CRUD board/user thì cần giới hạn: admin xem dashboard/list, block/unblock user; role update backend có nhưng UI cần kiểm tra.

## 15. Gợi ý use case nên có trong báo cáo

Actor đề xuất:

- Guest
- User
- Board Owner
- Board Member
- System Admin
- AI Service/OpenAI Provider

Use case chính:

1. Đăng ký tài khoản.
2. Xác thực email.
3. Đăng nhập/đăng xuất.
4. Cập nhật thông tin cá nhân.
5. Tạo board.
6. Xem danh sách board.
7. Xem chi tiết board Kanban.
8. Chỉnh sửa thông tin board.
9. Mời thành viên vào board.
10. Chấp nhận/từ chối lời mời board.
11. Xóa thành viên khỏi board.
12. Quản lý column.
13. Tạo và cập nhật card/task.
14. Kéo thả card/column.
15. Gán thành viên cho card.
16. Bình luận card.
17. Xem activity log.
18. Quản lý checklist/subtask.
19. Upload avatar/card cover.
20. Lọc/tìm kiếm card.
21. Xem Board Dashboard.
22. Drill-down từ dashboard về Kanban.
23. AI phân tích board.
24. AI gợi ý checklist cho card/task.
25. Quản trị hệ thống xem dashboard.
26. Quản trị hệ thống quản lý trạng thái user.

## 16. Gợi ý test case nên có trong báo cáo

| Nhóm | Test case |
|---|---|
| Auth | Register thành công, verify email, login đúng/sai password, refresh token, logout |
| Profile | Update displayName, đổi password, upload avatar |
| Board | Owner tạo board, xem board, edit board, member không edit được |
| Invitation | Owner invite, user nhận notification, accept/reject |
| Remove member | Owner remove member, member bị remove không còn truy cập, card.memberIds được pull |
| Column | Owner tạo/sửa/xóa/sắp xếp column; member bị chặn nếu không có quyền |
| Card | Tạo card, update title/status/priority/dates, mark complete |
| Drag-drop | Move card cùng column/khác column, move column, filter active thì DnD disabled |
| Checklist | Add/rename/delete checklist, add/toggle/rename/delete item, limit 5/20 |
| Comment/Activity | Add comment, xem comment tab, xem system log tab, pagination |
| Dashboard | KPI đúng, charts đúng, overdue/due soon/workload đúng, drill-down filter đúng |
| AI Board | Mock/real/fallback, healthScore, risks, priority recommendations, next actions |
| AI Checklist | Gợi ý checklist, chọn item, apply tuần tự, max 5 checklist bị chặn |
| Admin | System admin vào dashboard, xem users/boards, block/unblock user |
| Upload | Upload avatar, upload card cover |
| Security | User ngoài board không xem được board/API, member không remove member |

## 17. Hạn chế nên ghi trong báo cáo

- Chưa có archive/restore board/card hoàn chỉnh.
- Chưa có attachment file cho card.
- Labels đang để Coming soon.
- AI không chạy tự động nền; người dùng phải bấm phân tích/gợi ý.
- Kết quả AI không lưu database để xem lại lịch sử.
- Realtime mới tập trung vào invitation notification, chưa đồng bộ realtime mọi thay đổi Kanban.
- Hệ thống quản lý board theo mô hình Owner và Member.
- Checklist apply AI đang gọi API tuần tự, chưa có bulk endpoint tối ưu.
- Notification chưa phải hệ thống notification tổng quát cho mọi activity.

## 18. Hướng phát triển nên ghi trong báo cáo

- Archive/restore board và card.
- Attachment/file management cho card.
- Labels và custom fields.
- My Work Dashboard theo user.
- Realtime sync board/card/activity bằng Socket.IO.
- Lưu lịch sử AI analysis và cho phép so sánh theo thời gian.
- AI ưu tiên tự động theo deadline/workload/activity.
- AI tạo kế hoạch sprint hoặc phân bổ công việc cho thành viên.
- Bulk checklist apply endpoint để giảm số request.
- Notification tổng quát cho comment, assignment, deadline.
- Cơ chế chia sẻ link truy cập board (Public Share Link) nếu cần.
- Audit/security nâng cao cho admin.

## 19. Checklist đối chiếu project và báo cáo

| Nội dung báo cáo | Có trong source hiện tại | Ghi chú |
|---|---|---|
| React/Vite/MUI frontend | Có | `package.json` frontend |
| Node/Express backend | Có | `package.json` backend |
| MongoDB native driver | Có | Không phải Mongoose |
| JWT auth qua cookie | Có | access/refresh token |
| Email verification | Có | Brevo |
| Cloudinary upload | Có | Avatar/card cover |
| Board Owner/Member | Có | ownerIds/memberIds |
| System Admin | Có | role `system_admin` |
| Kanban drag-drop | Có | dnd-kit |
| Card status/priority/dueDate | Có | card model/service/UI |
| Checklist/subtask | Có | embedded checklists |
| Comment | Có | embedded comments |
| Activity log collection | Có | `activityLogs` |
| Board Dashboard | Có | KPI/charts/workload/AI |
| Admin Dashboard | Có | Users/boards/cards summary |
| AI Board Analysis | Có | OpenAI/mock/fallback |
| AI Checklist Suggestion | Có | OpenAI/mock/fallback + apply |
| Notification invitation | Có | invitation + socket |
| Full realtime Kanban | Chưa thấy | Nên ghi hướng phát triển |
| Archive/restore | Chưa hoàn thiện | Nên ghi hướng phát triển |
| Attachment | Chưa có | Coming soon |
| Labels | Chưa có | Coming soon |
| AI result persistence | Chưa có | Không ghi đã lưu DB |

