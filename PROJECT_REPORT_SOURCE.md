# Tài liệu nguồn phân tích project đồ án tốt nghiệp

Đề tài: **XÂY DỰNG HỆ THỐNG QUẢN LÝ CÔNG VIỆC THEO MÔ HÌNH KANBAN TÍCH HỢP AI HỖ TRỢ QUẢN LÝ VÀ PHÂN TÍCH CÔNG VIỆC**

Tài liệu này được lập từ việc đọc source code hiện tại trong workspace. Mục tiêu là làm tài liệu đầu vào để viết báo cáo đồ án tốt nghiệp, không phải README cài đặt ngắn gọn.

## 0. Phạm vi phân tích và lưu ý tên thư mục

Theo mô tả ban đầu, project gồm `web` và `api`. Trong workspace hiện tại, hai thư mục source thực tế là:

| Vai trò | Thư mục thực tế | Ghi chú |
|---|---|---|
| Frontend | `final-full-stack-mern-advanced-web` | React/Vite/MUI/Recharts, tương ứng folder `web` trong mô tả |
| Backend | `final-full-stack-mern-advanced-api` | Node.js/Express/MongoDB, tương ứng folder `api` trong mô tả |

Tên hiển thị trong source frontend là **TaskFlowDdow** tại `src/components/AppBar/AppBar.jsx`. `README.md` gốc ở thư mục root ghi `TaskFlow_Final_Project`, còn `package.json` mô tả là `Kanban work management system`. Khi viết báo cáo chính thức nên thống nhất một tên hệ thống.

## 1. Tổng quan hệ thống

### 1.1. Tên hệ thống

Tên hệ thống nên sử dụng trong báo cáo: **TaskFlowDdow - Hệ thống quản lý công việc theo mô hình Kanban**.

Cần xác nhận lại tên cuối cùng vì trong source đang có nhiều cách đặt tên:

- `TaskFlowDdow`: hiển thị trên AppBar và email verify.
- `TaskFlow_Final_Project`: README ở thư mục gốc.
- `Kanban work management system`: mô tả trong `package.json` frontend và backend.

### 1.2. Mục tiêu hệ thống

Hệ thống hỗ trợ người dùng quản lý công việc theo mô hình Kanban thông qua board, column và card/task. Người dùng có thể tạo board, mời thành viên, tổ chức công việc thành các cột, tạo card, kéo thả card giữa các cột, gán thành viên, cập nhật trạng thái, ưu tiên, thời hạn, checklist, bình luận và theo dõi dashboard.

### 1.3. Bài toán hệ thống giải quyết

Project giải quyết bài toán quản lý công việc nhóm theo trực quan:

- Tổ chức công việc theo board và cột Kanban.
- Theo dõi từng task bằng card có mô tả, thành viên, trạng thái, mức ưu tiên, ngày bắt đầu, ngày đến hạn, checklist và bình luận.
- Mời thành viên tham gia board và nhận lời mời qua notification.
- Ghi nhận hoạt động quan trọng của card để truy vết lịch sử thay đổi.
- Cung cấp dashboard ở cấp board và cấp system admin để hỗ trợ theo dõi tiến độ, tình trạng trễ hạn và tải công việc.

### 1.4. Đối tượng sử dụng

Các actor xác định từ source:

- **Guest**: người chưa đăng nhập, chỉ truy cập các màn hình đăng ký, đăng nhập và xác thực email.
- **User đã đăng nhập**: người dùng thông thường, có thể tạo board, xem board mình sở hữu hoặc là thành viên, thao tác card/task trong board được phép truy cập.
- **Board Owner**: người tạo board, có quyền quản lý cấu trúc board như mời thành viên, tạo/đổi tên/xóa column, sắp xếp column, cập nhật thông tin board.
- **Board Member**: người được mời và chấp nhận lời mời vào board, có thể xem board, tạo card, cập nhật card, bình luận, checklist, gán thành viên card và kéo thả card.
- **System Admin**: người dùng có role `system_admin`, có thể truy cập Admin Console để xem dashboard hệ thống, danh sách user, block/unblock user và xem danh sách board toàn hệ thống.

Source không thể hiện role riêng tên **Viewer** hoặc **Board Admin**. Quyền quản trị board hiện được phân biệt bằng `ownerIds`, còn thành viên thường bằng `memberIds`.

### 1.5. Giá trị thực tế

Hệ thống có giá trị thực tế ở các điểm:

- Hỗ trợ quản lý công việc nhóm theo luồng trực quan.
- Giúp thành viên biết việc nào đang làm, việc nào sắp đến hạn, việc nào quá hạn.
- Checklist giúp chia nhỏ task thành các đầu việc có thể tick hoàn thành.
- Activity log giúp truy vết thay đổi quan trọng của card.
- Dashboard giúp owner/member nắm nhanh tình trạng board và workload.
- Admin Console giúp quản trị tài khoản và quan sát dữ liệu tổng quan toàn hệ thống.

### 1.6. Khác biệt so với Kanban kéo thả đơn giản

Project không chỉ là bảng kéo thả card đơn giản. Source hiện có các lớp chức năng mở rộng:

- Đăng ký, xác thực email, đăng nhập, refresh token, logout.
- Phân quyền theo system admin, board owner, board member.
- Board có owner/member, invitation và notification.
- Card được mở rộng thành task có `status`, `priority`, `startDate`, `dueDate`, `completedAt`, `lastActivityAt`, `createdBy`.
- Card có mô tả Markdown, cover image, comment, member assignment và checklist nhiều cấp.
- Activity log collection riêng cho các hành động quan trọng.
- Board dashboard với thống kê trạng thái, ưu tiên, quá hạn, sắp đến hạn, checklist progress và workload.
- Admin dashboard và quản lý user ở cấp hệ thống.

## 2. Công nghệ sử dụng

### 2.1. Frontend

| Công nghệ/thư viện | Vai trò trong hệ thống |
|---|---|
| React 18 | Xây dựng UI dạng component |
| Vite | Dev server, build frontend |
| MUI Material UI | Component giao diện, layout, form, modal, table, chip, avatar, tab |
| MUI Icons | Icon cho action, menu, trạng thái |
| React Router DOM | Routing: `/login`, `/register`, `/boards`, `/boards/:boardId`, `/settings/*`, `/admin/*` |
| Redux Toolkit | Quản lý state global cho user, active board, active card, notification |
| Redux Persist | Lưu slice `user` vào localStorage để duy trì đăng nhập phía UI sau refresh trang |
| Axios | Gọi API backend |
| React Hook Form | Form đăng nhập, đăng ký, tạo board, invite, settings |
| @dnd-kit/core, @dnd-kit/sortable | Drag-drop column và card |
| Recharts | Vẽ chart cho Admin Dashboard và Board Dashboard |
| @uiw/react-md-editor | Editor và viewer Markdown cho description của card |
| rehype-sanitize | Sanitize Markdown preview để giảm rủi ro XSS |
| react-toastify | Hiển thị thông báo thành công/lỗi |
| material-ui-confirm | Dialog xác nhận logout, đổi mật khẩu, xóa column |
| socket.io-client | Nhận notification realtime cho lời mời board |
| lodash | `cloneDeep`, `debounce`, `isEmpty` |
| moment | Format thời gian comment/activity/notification |
| randomcolor | Tạo màu ngẫu nhiên cho card board preview ở danh sách board |

### 2.2. Backend

| Công nghệ/thư viện | Vai trò trong hệ thống |
|---|---|
| Node.js | Runtime backend |
| Express | Xây dựng REST API |
| MongoDB Node Driver | Kết nối và thao tác MongoDB |
| Joi | Validate request body, params và schema trước khi lưu |
| JSON Web Token | Access token và refresh token |
| cookie-parser | Đọc JWT từ httpOnly cookie |
| bcryptjs | Hash và kiểm tra password |
| multer | Nhận file upload avatar/card cover |
| cloudinary + streamifier | Upload ảnh lên Cloudinary từ buffer |
| @getbrevo/brevo | Gửi email xác thực tài khoản |
| socket.io | Gửi sự kiện realtime invitation |
| cors | Cấu hình CORS, cho phép credentials |
| http-status-codes | Chuẩn hóa HTTP status |
| uuid | Tạo verify token khi đăng ký |
| lodash | `cloneDeep` ở service |
| cross-env, nodemon, Babel | Dev/build backend |

### 2.3. Database

Backend dùng **MongoDB**. Source dùng MongoDB native driver, không dùng Mongoose. Các collection chính:

- `users`
- `boards`
- `columns`
- `cards`
- `invitations`
- `activityLogs`

### 2.4. Authentication

Authentication dùng JWT gồm:

- `accessToken`: lưu trong httpOnly cookie tên `accessToken`.
- `refreshToken`: lưu trong httpOnly cookie tên `refreshToken`.
- Cookie được set `httpOnly: true`, `secure: true`, `sameSite: 'none'`.
- Axios frontend bật `withCredentials = true` để tự gửi cookie.
- Khi access token hết hạn, backend trả `410 Gone`; axios interceptor gọi `/v1/users/refresh_token` rồi retry request cũ.

### 2.5. Upload ảnh

Đã triển khai upload:

- Avatar user: field multipart `avatar`, route `PUT /v1/users/update`.
- Cover card: field multipart `cardCover`, route `PUT /v1/cards/:id`.

Backend dùng `multer` để nhận file và `CloudinaryProvider.streamUpload` để upload lên Cloudinary. Chỉ chấp nhận `jpg`, `jpeg`, `png`, tối đa 10MB.

### 2.6. Email service

Đã triển khai gửi email xác thực tài khoản bằng **Brevo**. Khi register, backend tạo `verifyToken`, build link `/account/verification?email=...&token=...`, sau đó gửi email qua `BrevoProvider.sendEmail`.

### 2.7. Chart/dashboard

Frontend dùng **Recharts**:

- Admin Dashboard: PieChart user status, BarChart system overview.
- Board Dashboard: PieChart cards by status, BarChart cards by priority.

Backend có aggregate dashboard ở `cardModel.getBoardDashboard` và thống kê tổng quan ở `adminService.getDashboard`.

### 2.8. Drag-drop

Frontend dùng **@dnd-kit**:

- `DndContext`, `SortableContext`, `arrayMove`, `DragOverlay`.
- Custom MouseSensor và TouchSensor trong `src/customLibraries/DndKitSensors.js`.
- Drag column theo chiều ngang.
- Drag card theo chiều dọc trong column và giữa các column.

## 3. Kiến trúc tổng thể

### 3.1. Mô hình client-server

Project sử dụng kiến trúc client-server:

- Frontend React chạy trên Vite, hiển thị UI và gọi REST API.
- Backend Express cung cấp API version `/v1`.
- Backend kết nối MongoDB để lưu user, board, column, card, invitation và activity log.
- Socket.IO được dùng riêng cho realtime notification khi mời user vào board.

### 3.2. Luồng frontend gọi backend

Luồng chung:

1. User thao tác trên UI React.
2. Component gọi hàm API trong `src/apis/index.js` hoặc dispatch async thunk Redux.
3. Axios instance `authorizedAxiosInstance` gửi request đến `API_ROOT`.
4. Cookie JWT được gửi tự động do `withCredentials = true`.
5. Backend route `/v1/...` chạy validation, auth middleware, controller, service, model.
6. Response trả về frontend.
7. Frontend cập nhật Redux/local state và UI.

### 3.3. Backend kết nối MongoDB

File `src/config/mongodb.js` tạo `MongoClient`, kết nối `MONGODB_URI`, lấy database theo `DATABASE_NAME`, sau đó export `GET_DB()` để các model thao tác collection.

Server chỉ start sau khi `CONNECT_DB()` thành công.

### 3.4. Tổ chức folder backend

| Folder/file | Vai trò |
|---|---|
| `src/server.js` | Khởi tạo Express, HTTP server, Socket.IO, CORS, cookie parser, JSON body, routes và error middleware |
| `src/config` | Cấu hình environment, CORS, MongoDB |
| `src/routes/v1` | Định nghĩa route theo module |
| `src/controllers` | Nhận request/response, lấy param/body/user từ request, gọi service |
| `src/services` | Business logic, kiểm tra quyền, phối hợp model, upload, email, activity log |
| `src/models` | Joi schema, thao tác MongoDB collection |
| `src/validations` | Validate request trước controller |
| `src/middlewares` | Auth, upload, error handling |
| `src/providers` | JWT, Cloudinary, Brevo |
| `src/utils` | Constants, validators, formatters, permissions, pagination |
| `src/sockets` | Socket handler cho invitation |

### 3.5. Các tầng chính backend

- **Routes**: map endpoint đến middleware, validation và controller.
- **Controllers**: điều phối request, lấy `req.jwtDecoded`, `req.body`, `req.params`, `req.file`.
- **Services**: xử lý nghiệp vụ chính, ví dụ phân quyền board owner/member, tạo board, move card, checklist, activity log.
- **Models**: định nghĩa collection name, schema Joi và thao tác MongoDB.
- **Validations**: chặn request sai format trước khi vào controller.
- **Middlewares**: xác thực JWT, kiểm tra system admin, upload file, error handling.
- **Utils**: constants domain, validate regex, permission helper, formatter.

### 3.6. Tổ chức folder frontend

| Folder/file | Vai trò |
|---|---|
| `src/main.jsx` | Mount React app, cấu hình Provider, PersistGate, BrowserRouter, MUI theme, ToastContainer |
| `src/App.jsx` | Khai báo route, protected route, admin route |
| `src/apis/index.js` | Wrapper gọi API backend |
| `src/utils/authorizeAxios.js` | Axios instance, interceptor loading, refresh token, logout khi 401 |
| `src/redux` | Store và các slice: user, activeBoard, activeCard, notifications |
| `src/pages/Auth` | Login, register, account verification |
| `src/pages/Boards` | Board list, create board modal, board detail, board bar, filter, dashboard, board content |
| `src/pages/Admin` | Admin layout, dashboard, users, boards |
| `src/pages/Settings` | Account và security settings |
| `src/components/AppBar` | Navigation bar, board search, notifications, profile menu |
| `src/components/Modal/ActiveCard` | Card modal, description, checklist, activity, card members |
| `src/customLibraries` | Custom dnd-kit sensors |
| `src/customHooks` | `useDebounceFn` |

### 3.7. Các tầng chính frontend

- **Pages**: màn hình route-level như Auth, Boards, Board Detail, Admin, Settings.
- **Components**: AppBar, Modal, Form, Loading, BoardBar, BoardContent.
- **APIs**: hàm gọi API tập trung.
- **Redux/store**: trạng thái current user, active board, active card, notifications.
- **Hooks/utils**: debounce, validator, formatter, sort, constants, axios interceptor.

## 4. Actor/role trong hệ thống

| Actor/role | Có trong source | Mô tả |
|---|---:|---|
| Guest | Có | Truy cập register/login/account verification; protected route redirect về login |
| User đã đăng nhập | Có | Role mặc định `user`; có thể tạo board, xem board của mình, tham gia board được mời |
| Board Owner | Có | User nằm trong `board.ownerIds`; thường là người tạo board |
| Board Member | Có | User nằm trong `board.memberIds`; được thêm khi accept invitation |
| System Admin | Có | User có role `system_admin`; backend còn hỗ trợ legacy role `admin` ở middleware |
| Viewer | Không thấy | Không có role viewer riêng trong source |
| Board Admin riêng | Không thấy | Không có board admin riêng; quyền quản trị board là owner |

## 5. Phân quyền

### 5.1. System Admin

System Admin được xác định bằng role `system_admin` trong frontend và backend. Backend helper `userModel.isSystemAdminRole` còn chấp nhận legacy role `admin`.

Quyền đã triển khai:

- Truy cập `/admin/dashboard`, `/admin/users`, `/admin/boards`.
- Gọi các API `/v1/admin/*`.
- Xem thống kê tổng quan user/board/card.
- Xem danh sách user có phân trang và tìm kiếm.
- Block/unblock user.
- Xem danh sách board toàn hệ thống.
- Backend có API đổi role user nhưng frontend chưa expose UI/API wrapper cho chức năng này.

### 5.2. User thường

User thường:

- Đăng nhập nếu tài khoản active và không bị blocked.
- Tạo board mới, tự trở thành owner.
- Xem danh sách board mà mình là owner/member.
- Xem chi tiết board nếu thuộc `ownerIds` hoặc `memberIds`.
- Thao tác card trong board mà mình có quyền truy cập.

### 5.3. Board Owner

Board Owner có quyền:

- Update thông tin board.
- Tạo column.
- Đổi tên column.
- Xóa column và toàn bộ card trong column.
- Sắp xếp column.
- Mời user vào board.
- Làm mọi thao tác card như board member.

### 5.4. Board Member

Board Member có quyền:

- Xem board detail.
- Xem dashboard board.
- Tạo card.
- Cập nhật card: title, description, cover, status, priority, dates, comment, members, checklist.
- Kéo thả card trong cùng column hoặc sang column khác.
- Reorder card trong column.
- Join/leave card.

Board Member không được:

- Update thông tin board.
- Tạo/đổi tên/xóa column.
- Sắp xếp column.
- Mời thành viên vào board.

### 5.5. User ngoài board bị chặn như thế nào

Backend chặn user ngoài board ở service/model:

- `boardModel.getDetails` match board theo `_id`, `_destroy: false` và `$or` user nằm trong `ownerIds` hoặc `memberIds`.
- `boardService.getDashboard` kiểm tra owner/member.
- `columnService` kiểm tra board owner hoặc owner/member tùy action.
- `cardService` kiểm tra board owner/member trước khi tạo/update card.
- `activityLogService.getCardActivities` kiểm tra owner/member trước khi trả log.
- `invitationService.updateBoardInvitation` chỉ invitee của invitation được cập nhật lời mời.

### 5.6. Frontend ẩn/chặn UI admin

Frontend:

- `AdminRoute` trong `App.jsx` redirect user không phải `system_admin` về `/boards`.
- AppBar chỉ hiển thị button `Admin Console` nếu `currentUser.role === 'system_admin'`.
- Profile menu chỉ hiển thị menu Admin nếu role là `system_admin`.

Lưu ý: frontend không chấp nhận legacy role `admin`, trong khi backend có hỗ trợ legacy admin. Nếu database còn user role `admin`, cần xác nhận luồng UI mong muốn.

### 5.7. API quan trọng có kiểm tra quyền

| Nhóm API | Kiểm tra auth | Kiểm tra quyền nghiệp vụ |
|---|---:|---|
| Board list/detail/dashboard | Có | Chỉ owner/member xem được board cá nhân |
| Board update | Có | Chỉ board owner |
| Create/update/delete column | Có | Owner cho quản lý column, owner/member cho reorder cardOrderIds |
| Create/update card | Có | Owner/member |
| Move card different column | Có | Owner/member |
| Invitation create | Có | Chỉ board owner mời |
| Invitation update | Có | Chỉ invitee cập nhật lời mời |
| Activity log | Có | Owner/member của board chứa card |
| Admin | Có | `requireSystemAdmin` |

## 6. Chức năng xác thực người dùng

### 6.1. Đăng ký

Endpoint: `POST /v1/users/register`.

Luồng:

1. Frontend gửi `email`, `password`.
2. Backend validate email/password.
3. Kiểm tra email đã tồn tại.
4. Hash password bằng `bcryptjs`.
5. Tạo `username` và `displayName` từ phần trước `@` của email.
6. Tạo `verifyToken` bằng `uuid`.
7. Lưu user với `isActive: false`, `isBlocked: false`, role mặc định `user`.
8. Gửi email xác thực bằng Brevo.
9. Trả user đã lọc field nhạy cảm qua `pickUser`.

### 6.2. Xác thực email

Endpoint: `PUT /v1/users/verify`.

Frontend route `/account/verification` đọc query `email` và `token`, gọi API verify. Backend:

- Tìm user theo email.
- Chặn nếu không tồn tại, đã active hoặc token sai.
- Update `isActive: true`, `verifyToken: null`.

### 6.3. Đăng nhập

Endpoint: `POST /v1/users/login`.

Backend kiểm tra:

- Tài khoản tồn tại và không `_destroy`.
- `isActive = true`.
- `isBlocked = false`.
- Password đúng bằng `bcryptjs.compareSync`.

Nếu hợp lệ:

- Tạo access token và refresh token.
- Set hai token vào httpOnly cookie.
- Trả payload user đã lọc cùng token.

### 6.4. Refresh token/session

Endpoint: `GET /v1/users/refresh_token`.

Backend đọc refresh token từ cookie, verify token, kiểm tra user vẫn tồn tại, active và không blocked. Nếu hợp lệ, tạo access token mới và set lại cookie `accessToken`.

Frontend interceptor:

- Nếu nhận `410 Gone`, gọi refresh token.
- Sau refresh thành công, retry request gốc.
- Nếu nhận `401`, dispatch logout.

### 6.5. Đăng xuất

Endpoint: `DELETE /v1/users/logout`.

Backend clear cookie `accessToken`, `refreshToken` và trả `{ loggedOut: true }`. Source không có token blacklist phía server.

### 6.6. Cập nhật thông tin cá nhân

Endpoint: `PUT /v1/users/update`.

Chức năng đã có:

- Đổi `displayName`.
- Đổi password bằng `current_password` và `new_password`.
- Upload avatar.

Các field bị chặn update trực tiếp ở model: `_id`, `email`, `username`, `role`, `isActive`, `isBlocked`, `blockedAt`, `blockedReason`, `verifyToken`, `_destroy`, `createdAt`, `updatedAt`.

### 6.7. Upload avatar

Frontend gửi `FormData` với field `avatar`. Backend nhận file qua `multer`, upload Cloudinary folder `users`, lưu URL vào `user.avatar`.

### 6.8. Active/blocked account

Backend kiểm tra `isActive` và `isBlocked` ở:

- `userService.login`
- `userService.refreshToken`
- `userService.update`
- `authMiddleware.isAuthorized`

Nếu bị block, user không thể đăng nhập hoặc dùng protected API.

### 6.9. Admin block/unblock user

Endpoint: `PUT /v1/admin/users/:id/status`.

System Admin có thể:

- Set `isBlocked`.
- Lưu `blockedAt`.
- Lưu `blockedReason` nếu block.
- Không được tự block chính mình.

## 7. Chức năng quản lý board

### 7.1. Tạo board

Endpoint: `POST /v1/boards`.

Board gồm `title`, `description`, `type`. Backend tạo `slug` từ title và set `ownerIds` chứa user tạo board.

### 7.2. Xem danh sách board

Endpoint: `GET /v1/boards?page=&itemsPerPage=&q[title]=`.

Backend chỉ trả board mà user hiện tại là owner hoặc member. Có phân trang, mặc định `page = 1`, `itemsPerPage = 12`. Sort theo title.

### 7.3. Tìm kiếm board

Frontend có autocomplete search board trên AppBar. Search gọi `GET /v1/boards?q[title]=...`, debounce 1 giây. Kết quả chọn sẽ navigate sang `/boards/:boardId`.

### 7.4. Xem chi tiết board

Endpoint: `GET /v1/boards/:id`.

Backend aggregate:

- Board.
- Columns thuộc board.
- Cards thuộc board.
- Owners.
- Members.

Service đưa card về đúng column bằng `column.cards = resBoard.cards.filter(...)`, sau đó xóa mảng `cards` ở cấp board response.

### 7.5. Cập nhật thông tin board

Endpoint: `PUT /v1/boards/:id`.

Board Owner mới được update. Field có thể update gồm `title`, `description`, `type`, `columnOrderIds`. Khi update `columnOrderIds`, backend convert sang ObjectId.

### 7.6. Mời thành viên vào board

Endpoint: `POST /v1/invitations/board`.

Board Owner gửi `inviteeEmail`, `boardId`. Backend:

- Tìm inviter, invitee, board.
- Kiểm tra inviter là owner.
- Tạo invitation type `BOARD_INVITATION`, status `PENDING`.
- Trả invitation kèm board, inviter, invitee.

Frontend emit socket event `FE_USER_INVITED_TO_BOARD`; backend broadcast `BE_USER_INVITED_TO_BOARD`; invitee nhận notification nếu `inviteeId` trùng current user.

### 7.7. Xem thành viên board

Board detail response có `owners` và `members`. Frontend tạo `board.FE_allUsers = board.owners.concat(board.members)`, hiển thị avatar group ở BoardBar và dùng danh sách này để gán member vào card.

### 7.8. Board public/private

Board schema có `type` gồm `public` và `private`, UI hiển thị type. Tuy nhiên source hiện tại chưa dùng `type` để quyết định quyền truy cập. Dù board là public, API detail vẫn yêu cầu user thuộc `ownerIds` hoặc `memberIds`.

## 8. Chức năng quản lý column/list

### 8.1. Tạo column

Endpoint: `POST /v1/columns`.

Chỉ Board Owner được tạo column. Sau khi tạo, backend push column id vào `board.columnOrderIds`. Frontend thêm placeholder card cho column rỗng để dnd-kit kéo thả ổn định.

### 8.2. Đổi tên column

Endpoint: `PUT /v1/columns/:id` với `{ title }`.

Chỉ Board Owner được đổi tên.

### 8.3. Xóa column

Endpoint: `DELETE /v1/columns/:id`.

Chỉ Board Owner được xóa. Backend:

- Xóa column bằng `deleteOne`.
- Xóa tất cả card trong column bằng `deleteMany`.
- Pull column id khỏi `board.columnOrderIds`.

Đây là xóa cứng, không phải archive/restore.

### 8.4. Sắp xếp column

Frontend cho kéo thả column theo chiều ngang. Chỉ Board Owner có listener drag column. Sau khi drop, frontend gọi `PUT /v1/boards/:id` với `columnOrderIds`.

### 8.5. Quản lý cardOrderIds

Mỗi column có `cardOrderIds` để lưu thứ tự card. Khi:

- Tạo card: backend push card id vào `column.cardOrderIds`.
- Reorder card trong cùng column: frontend gọi `PUT /v1/columns/:id` với `cardOrderIds`.
- Move card sang column khác: backend update `prevCardOrderIds`, `nextCardOrderIds` và `card.columnId`.

### 8.6. Column liên kết với board

Column có field `boardId`. Board lưu danh sách thứ tự column qua `columnOrderIds`. Board detail dùng lookup `columns` theo `board._id = column.boardId`.

## 9. Chức năng quản lý card/task

### 9.1. Tạo card

Endpoint: `POST /v1/cards`.

Board Owner hoặc Board Member được tạo card. Input gồm `boardId`, `columnId`, `title`. Backend:

- Kiểm tra board tồn tại.
- Kiểm tra column tồn tại và thuộc board.
- Kiểm tra user là owner/member.
- Tạo card mặc định:
  - `createdBy` là user hiện tại.
  - `status = TODO`.
  - `priority = MEDIUM`.
  - `startDate = null`.
  - `dueDate = null`.
  - `completedAt = null`.
  - `lastActivityAt = createdAt`.
- Push card id vào column.
- Ghi activity log `CARD_CREATED`.

### 9.2. Xem chi tiết card

Không có API riêng `GET /cards/:id` trong source. Frontend lấy card từ board detail response, khi click card thì đưa card vào Redux `activeCard.currentActiveCard` và mở modal `ActiveCard`.

### 9.3. Cập nhật title/description

Endpoint: `PUT /v1/cards/:id`.

Frontend cập nhật:

- Title qua `ToggleFocusInput`.
- Description qua Markdown editor.

Backend sanitize các field nhạy cảm và update card. Description được hiển thị bằng `MDEditor.Markdown` có `rehype-sanitize` ở preview editor.

### 9.4. Upload cover

Frontend gửi `FormData` field `cardCover`. Backend upload Cloudinary folder `card-covers`, lưu URL vào `card.cover`, cập nhật `updatedAt`, `lastActivityAt`, ghi log `COVER_UPDATED`.

### 9.5. Comment

Comments được embedded trong card:

- `_id`
- `userId`
- `userEmail`
- `userAvatar`
- `userDisplayName`
- `content`
- `commentedAt`

Frontend thêm comment bằng Enter trong `CardActivitySection`. Backend unshift comment vào đầu mảng `comments`, cập nhật `lastActivityAt`, ghi activity log `COMMENT_CREATED`.

### 9.6. Join/Leave card và assign/member

Card có `memberIds`. Người dùng có thể:

- Join/leave chính mình.
- Chọn board user trong popover để add/remove khỏi card.

Backend nhận `incomingMemberInfo` gồm `userId` và `action` (`ADD` hoặc `REMOVE`), sau đó push/pull `memberIds`. Source không tạo role riêng assignee; card member chính là người được gán vào card. Mọi owner/member của board đều có thể cập nhật memberIds của card.

### 9.7. Kéo thả trong cùng column

Frontend dùng dnd-kit `arrayMove` để reorder card trong cùng column, cập nhật Redux/local state và gọi:

`PUT /v1/columns/:id` với `cardOrderIds`.

Backend cho phép owner/member nếu request chỉ update `cardOrderIds`. Source không ghi activity log cho reorder trong cùng column.

### 9.8. Kéo thả sang column khác

Frontend gọi:

`PUT /v1/boards/supports/moving_card`.

Backend:

- Kiểm tra card, previous column, next column.
- Kiểm tra cả hai column cùng board với card.
- Kiểm tra user là owner/member.
- Update `prevColumn.cardOrderIds`.
- Update `nextColumn.cardOrderIds`.
- Update `card.columnId`, `updatedAt`, `lastActivityAt`.
- Ghi activity log `CARD_MOVED` kèm from/to column title.

### 9.9. Status

Card status enum:

- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `DONE`
- `CANCELLED`

Khi status đổi:

- Backend ghi activity log `STATUS_CHANGED`.
- Nếu status chuyển sang `DONE`, backend set `completedAt`.
- Nếu card đang `DONE` rồi chuyển sang status khác, backend set `completedAt = null`.

### 9.10. Priority

Card priority enum:

- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

Khi priority đổi, backend ghi activity log `PRIORITY_CHANGED`.

### 9.11. Dates

Card có:

- `startDate`
- `dueDate`

Backend normalize về timestamp, cho phép null. Nếu cả startDate và dueDate tồn tại thì startDate phải nhỏ hơn hoặc bằng dueDate. Khi đổi date, backend ghi log `DATES_CHANGED`.

### 9.12. CompletedAt, LastActivityAt, CreatedBy

- `createdBy`: ObjectId user tạo card.
- `completedAt`: set khi status `DONE`, clear khi chuyển khỏi `DONE`.
- `lastActivityAt`: cập nhật khi tạo card, update card, comment, cover, member, checklist, move sang column khác.

### 9.13. Badge trên card preview

Card preview hiển thị:

- Priority chip.
- Date range chip.
- Completed/Cancelled chip.
- Overdue/Due soon/Due date chip nếu có dueDate và status chưa DONE/CANCELLED.
- Checklist progress chip dạng `completed/total`.
- Member count, comment count, attachment count nếu tồn tại.

Lưu ý: attachment chưa có schema/API backend; UI chỉ có chỗ hiển thị nếu `card.attachments` tồn tại và menu `Attachment` đang `Coming soon`.

### 9.14. Checklist

Checklist được triển khai chi tiết trong card modal. Phân tích riêng ở mục 10.

### 9.15. Activity Log

Activity log được triển khai bằng collection riêng `activityLogs`. Phân tích riêng ở mục 11.

### 9.16. Filter/Search

Card filter trong board detail được triển khai ở frontend. Phân tích riêng ở mục 13.

### 9.17. Chức năng card chưa thấy trong source

- Không thấy API xóa card riêng.
- Không thấy archive/restore card dù constants có `CARD_ARCHIVED`, `CARD_UNARCHIVED` và dashboard loại `isArchived`.
- Không thấy labels triển khai; UI ghi `Coming soon`.
- Không thấy attachments triển khai; UI ghi `Coming soon`.
- Không thấy realtime đồng bộ board/card drag-drop đa người dùng.

## 10. Checklist

### 10.1. Cấu trúc checklist trong card

Checklist là embedded array trong document card:

```js
checklists: [
  {
    _id,
    title,
    items: [
      {
        _id,
        title,
        isCompleted,
        completedAt,
        createdAt
      }
    ],
    createdAt
  }
]
```

### 10.2. Nhiều checklist hay một checklist

Source hỗ trợ **nhiều checklist trong một card**. Backend giới hạn tối đa:

- 5 checklist mỗi card.
- 20 item mỗi checklist.

### 10.3. Checklist item gồm field nào

Mỗi checklist item gồm:

- `_id`: string ObjectId.
- `title`: nội dung item.
- `isCompleted`: boolean.
- `completedAt`: timestamp hoặc null.
- `createdAt`: timestamp.

### 10.4. Thêm/sửa/xóa checklist

Không có endpoint riêng cho checklist. Tất cả dùng `PUT /v1/cards/:id` với payload action:

- `{ checklistToAdd: { title } }`
- `{ checklistToRename: { checklistId, title } }`
- `{ checklistToDelete: { checklistId } }`

Backend chỉ cho phép một checklist action trong một request.

### 10.5. Thêm/sửa/xóa/tick/untick item

Payload action:

- `{ checklistItemToAdd: { checklistId, title } }`
- `{ checklistItemToRename: { checklistId, itemId, title } }`
- `{ checklistItemToToggle: { checklistId, itemId, isCompleted } }`
- `{ checklistItemToDelete: { checklistId, itemId } }`

Tick item set `isCompleted = true` và `completedAt = activityAt`; untick set `completedAt = null`.

### 10.6. Progress bar

Frontend tính progress mỗi checklist:

- `completed = số item isCompleted`.
- `total = tổng số item`.
- `percent = Math.round(completed / total * 100)`.

UI hiển thị `LinearProgress` và chip `completed/total`.

### 10.7. Badge progress ngoài card

Card preview tính tổng tất cả checklist item trong card:

- Tổng completed.
- Tổng item.
- Hiển thị chip `completed/total`.
- Nếu tất cả item hoàn thành thì chip màu success.

### 10.8. Checklist ảnh hưởng dashboard/activity log

Dashboard board tính `averageChecklistProgress` trong backend:

- Với từng card có checklist item, tính progress = completedItems / totalItems * 100.
- Lấy trung bình progress các card có checklist item.
- Làm tròn bằng `Math.round`.

Activity log ghi các action:

- `CHECKLIST_CREATED`
- `CHECKLIST_RENAMED`
- `CHECKLIST_DELETED`
- `CHECKLIST_ITEM_CREATED`
- `CHECKLIST_ITEM_RENAMED`
- `CHECKLIST_ITEM_COMPLETED`
- `CHECKLIST_ITEM_UNCOMPLETED`
- `CHECKLIST_ITEM_DELETED`

## 11. Activity Log

### 11.1. Activity log dùng collection riêng hay embedded

Activity log dùng collection riêng: `activityLogs`.

Comments vẫn embedded trong `cards.comments`, đồng thời khi tạo comment backend cũng ghi một activity log `COMMENT_CREATED`.

### 11.2. Schema activity log

Collection `activityLogs` có field:

| Field | Ý nghĩa |
|---|---|
| `boardId` | Board chứa card |
| `cardId` | Card phát sinh activity |
| `actorId` | User thực hiện hành động |
| `actorEmail` | Snapshot email actor |
| `actorDisplayName` | Snapshot tên hiển thị actor |
| `actorAvatar` | Snapshot avatar actor |
| `action` | Loại hành động |
| `metadata` | Dữ liệu phụ theo từng action |
| `createdAt` | Thời điểm ghi log |

### 11.3. Những action được ghi log

Đã thấy backend ghi log cho:

- `CARD_CREATED`
- `CARD_MOVED`
- `STATUS_CHANGED`
- `PRIORITY_CHANGED`
- `DATES_CHANGED`
- `COMMENT_CREATED`
- `COVER_UPDATED`
- `CHECKLIST_CREATED`
- `CHECKLIST_RENAMED`
- `CHECKLIST_DELETED`
- `CHECKLIST_ITEM_CREATED`
- `CHECKLIST_ITEM_RENAMED`
- `CHECKLIST_ITEM_COMPLETED`
- `CHECKLIST_ITEM_UNCOMPLETED`
- `CHECKLIST_ITEM_DELETED`
- `MEMBER_JOINED`
- `MEMBER_LEFT`

Constants còn có `CARD_ARCHIVED`, `CARD_UNARCHIVED` nhưng chưa thấy service nào ghi hai action này.

### 11.4. Backend tự ghi log ở đâu

Backend tự ghi log trong:

- `cardService.createNew`: card created.
- `cardService.update`: comment, cover, member, status, priority, dates, checklist.
- `boardService.moveCardToDifferentColumn`: card moved.

Tất cả đi qua `activityLogService.safeRecordCardActivity`. Hàm này catch lỗi và không làm hỏng nghiệp vụ chính nếu ghi log thất bại.

### 11.5. Frontend không tự tạo log

Frontend không gọi API tạo activity log trực tiếp. Frontend chỉ thực hiện nghiệp vụ chính như update card, move card; backend tự ghi log.

### 11.6. API lấy activity log

Endpoint:

`GET /v1/cards/:id/activities?page=&itemsPerPage=&excludeCommentCreated=true`

Backend:

- Kiểm tra card tồn tại.
- Kiểm tra user là owner/member của board.
- Phân trang mặc định 20, tối đa 50.
- Nếu `excludeCommentCreated=true`, loại `COMMENT_CREATED`.

### 11.7. UI Comments/System Log trong card modal

`CardActivitySection` có hai tab:

- **Comments**: đọc từ `activeCard.comments`, phân trang phía frontend 5 comment/trang.
- **System Log**: gọi API activity log, exclude comment, phân trang 5 log/trang ở frontend request.

### 11.8. Ý nghĩa activity log

Activity log giúp:

- Truy vết ai thay đổi trạng thái, ưu tiên, ngày hạn.
- Theo dõi quá trình xử lý card.
- Làm dữ liệu đầu vào phù hợp cho dashboard, báo cáo tiến độ và định hướng tích hợp AI sau này.

## 12. Dashboard

### 12.1. Admin Dashboard

Đã triển khai ở `/admin/dashboard`.

Backend endpoint: `GET /v1/admin/dashboard`.

Chỉ System Admin được truy cập. Chỉ số:

| Chỉ số | Cách tính |
|---|---|
| `totalUsers` | Count users `_destroy: false` |
| `activeUsers` | Count users `_destroy: false`, `isActive: true` |
| `blockedUsers` | Count users `_destroy: false`, `isBlocked: true` |
| `totalBoards` | Count boards `_destroy: false` |
| `totalCards` | Count cards `_destroy: false` |

Frontend hiển thị:

- Stat cards.
- PieChart user status: active vs blocked.
- BarChart system overview: users, boards, cards.

### 12.2. Admin Users

Đã triển khai ở `/admin/users`.

Chức năng:

- Xem danh sách user.
- Tìm kiếm theo email hoặc display name ở UI.
- Phân trang.
- Hiển thị role, email status, account status.
- Block/unblock user.

Backend search user hỗ trợ `email`, `username`, `displayName`, `role`; UI hiện chỉ dùng `email`, `displayName`.

### 12.3. Admin Boards

Đã triển khai ở `/admin/boards`.

Chức năng:

- Xem danh sách board toàn hệ thống.
- Tìm kiếm theo title.
- Phân trang.
- Xem dialog thông tin board.
- Không thay đổi dữ liệu board.

### 12.4. Board Dashboard

Đã triển khai trong board detail, chuyển tab/chip `Dashboard` ở BoardBar.

Backend endpoint: `GET /v1/boards/:id/dashboard`.

Chỉ owner/member của board được xem.

Chỉ số:

| Chỉ số | Cách tính |
|---|---|
| `totalCards` | Count card active trong board |
| `completedCards` | Count card có `status = DONE` |
| `overdueCardsCount` | `dueDate < now` và status không thuộc `DONE`, `CANCELLED` |
| `dueSoonCardsCount` | `dueDate` từ now đến 3 ngày tới, status không `DONE`, `CANCELLED` |
| `cardsWithoutDueDate` | Không có dueDate hoặc dueDate null, status chưa đóng |
| `cardsByStatus` | Group theo status, normalize đủ enum status |
| `cardsByPriority` | Group theo priority, normalize đủ enum priority |
| `averageChecklistProgress` | Trung bình progress checklist của các card có checklist item |
| `memberWorkload` | Unwind `memberIds`, group số card theo member |
| `overdueCards` | Danh sách tối đa 10 card quá hạn, sort dueDate tăng dần |
| `dueSoonCards` | Danh sách tối đa 10 card sắp đến hạn, sort dueDate tăng dần |

Frontend hiển thị:

- Stat cards.
- PieChart cards by status.
- BarChart cards by priority.
- List overdue cards.
- List due soon cards.
- Member workload progress.

### 12.5. Dashboard drill-down

Board Dashboard có drill-down về Kanban filter cho:

- Overdue.
- Due Soon.

Khi click stat/list tương ứng, frontend set filter và chuyển về tab Kanban. Chưa thấy drill-down cho status hoặc priority chart.

## 13. Filter/Search

### 13.1. Board search

AppBar có autocomplete search board:

- Search theo title.
- Gọi API `/v1/boards?q[title]=...`.
- Debounce 1 giây.
- Chỉ trả board mà user có quyền truy cập.

### 13.2. Card filter trong board detail

Board detail có filter panel:

- Search theo card title.
- Filter status.
- Filter priority.
- Overdue only.
- Due soon.
- Assigned to me.
- Clear filters.

### 13.3. Filter logic AND

Hàm `doesCardMatchFilters` áp dụng logic AND:

- Nếu search có giá trị, title phải chứa search text.
- Nếu chọn status, card status phải nằm trong danh sách.
- Nếu chọn priority, card priority phải nằm trong danh sách.
- Nếu overdue bật, card phải quá hạn.
- Nếu dueSoon bật, card phải sắp đến hạn.
- Nếu assignedToMe bật, current user phải nằm trong `card.memberIds`.

`overdue` và `dueSoon` được xử lý mutual exclusive: bật cái này sẽ tắt cái kia.

### 13.4. Disable drag-drop khi filter active

Khi filter active:

- Board hiển thị alert: `Drag and drop is disabled while filters are applied`.
- `BoardContent` nhận `isDragDisabled`.
- dnd-kit sortable bị disabled.

Lý do kỹ thuật: khi card list đang bị lọc, thứ tự hiển thị không còn là thứ tự đầy đủ của column. Nếu cho kéo thả trên danh sách đã lọc, `cardOrderIds` gửi lên backend có thể thiếu các card không hiển thị, gây sai thứ tự dữ liệu thật.

## 14. Admin/System management

### 14.1. System Admin role

User role trong model:

- `user`
- `system_admin`
- legacy `client`
- legacy `admin`

Frontend chỉ xem `system_admin` là admin. Backend xem `system_admin` và legacy `admin` là system admin.

### 14.2. Admin route và admin guard

Frontend:

- `AdminRoute` trong `App.jsx`.
- Nếu chưa login redirect `/login`.
- Nếu không phải `system_admin` redirect `/boards`.

Backend:

- `adminRoute` dùng `authMiddleware.isAuthorized`.
- Sau đó dùng `authMiddleware.requireSystemAdmin`.

### 14.3. Quản lý user

Đã có:

- List user.
- Search.
- Pagination.
- Block/unblock.
- Hiển thị role, active status, blocked status.

Backend có API:

- `GET /v1/admin/users/:id`.
- `PUT /v1/admin/users/:id/role`.

Nhưng frontend hiện chưa có UI/API wrapper để xem detail riêng hoặc đổi role.

### 14.4. Quản lý board toàn hệ thống

Admin Boards cho phép xem board toàn hệ thống, search title, pagination và xem dialog thông tin. Không thấy chức năng admin xóa/sửa board.

### 14.5. Ý nghĩa admin

Admin giúp:

- Kiểm soát tài khoản vi phạm qua block/unblock.
- Theo dõi quy mô dữ liệu hệ thống.
- Hỗ trợ vận hành hệ thống khi số lượng user/board/card tăng.

## 15. Database/domain model

### 15.1. User

Collection: `users`.

| Field | Ý nghĩa |
|---|---|
| `_id` | ObjectId user |
| `email` | Email đăng nhập, unique theo logic |
| `password` | Password đã hash |
| `username` | Tên tài khoản, tạo từ email |
| `displayName` | Tên hiển thị |
| `avatar` | URL avatar Cloudinary hoặc null |
| `role` | `user`, `system_admin`, legacy `client`, `admin` |
| `isActive` | Đã xác thực email hay chưa |
| `isBlocked` | Có bị admin block hay không |
| `blockedAt` | Thời điểm block |
| `blockedReason` | Lý do block |
| `verifyToken` | Token verify email |
| `createdAt`, `updatedAt` | Timestamp |
| `_destroy` | Soft delete flag |

Quan hệ:

- User owns many Boards qua `boards.ownerIds`.
- User joins many Boards qua `boards.memberIds`.
- User assigned to many Cards qua `cards.memberIds`.
- User creates many Cards qua `cards.createdBy`.
- User creates many ActivityLogs qua `activityLogs.actorId`.
- User sends/receives many Invitations qua `inviterId`, `inviteeId`.

### 15.2. Board

Collection: `boards`.

| Field | Ý nghĩa |
|---|---|
| `_id` | ObjectId board |
| `title` | Tên board |
| `slug` | Slug từ title |
| `description` | Mô tả board |
| `type` | `public` hoặc `private` |
| `columnOrderIds` | Thứ tự column |
| `ownerIds` | Danh sách owner |
| `memberIds` | Danh sách member |
| `createdAt`, `updatedAt` | Timestamp |
| `_destroy` | Soft delete flag |

Quan hệ:

- Board has many Columns.
- Board has many Cards.
- Board has many Invitations.
- Board has many ActivityLogs thông qua card.
- Board belongs to many owners và members.

### 15.3. Column

Collection: `columns`.

| Field | Ý nghĩa |
|---|---|
| `_id` | ObjectId column |
| `boardId` | Board chứa column |
| `title` | Tên column |
| `cardOrderIds` | Thứ tự card trong column |
| `createdAt`, `updatedAt` | Timestamp |
| `_destroy` | Soft delete flag trong schema, nhưng delete hiện dùng hard delete |

Quan hệ:

- Column belongs to one Board.
- Column has many Cards.

### 15.4. Card

Collection: `cards`.

| Field | Ý nghĩa |
|---|---|
| `_id` | ObjectId card |
| `boardId` | Board chứa card |
| `columnId` | Column hiện tại |
| `title` | Tên card/task |
| `description` | Mô tả Markdown |
| `createdBy` | User tạo card |
| `status` | Trạng thái task |
| `priority` | Mức ưu tiên |
| `startDate` | Ngày bắt đầu |
| `dueDate` | Ngày đến hạn |
| `completedAt` | Thời điểm hoàn thành |
| `lastActivityAt` | Hoạt động gần nhất |
| `cover` | URL ảnh cover |
| `memberIds` | User được gán vào card |
| `comments` | Embedded comments |
| `checklists` | Embedded checklists |
| `createdAt`, `updatedAt` | Timestamp |
| `_destroy` | Soft delete flag |

Quan hệ:

- Card belongs to one Board.
- Card belongs to one Column.
- Card has many Comments.
- Card has many Checklists.
- Card has many ActivityLogs.
- Card has many assigned Users.

### 15.5. Invitation

Collection: `invitations`.

| Field | Ý nghĩa |
|---|---|
| `_id` | ObjectId invitation |
| `inviterId` | User gửi lời mời |
| `inviteeId` | User được mời |
| `type` | Hiện có `BOARD_INVITATION` |
| `boardInvitation.boardId` | Board được mời vào |
| `boardInvitation.status` | `PENDING`, `ACCEPTED`, `REJECTED` |
| `createdAt`, `updatedAt` | Timestamp |
| `_destroy` | Soft delete flag |

Quan hệ:

- Invitation belongs to inviter User.
- Invitation belongs to invitee User.
- BoardInvitation belongs to Board.

### 15.6. ActivityLog

Collection: `activityLogs`.

Xem chi tiết schema ở mục 11.

Quan hệ:

- ActivityLog belongs to Board.
- ActivityLog belongs to Card.
- ActivityLog belongs to actor User.

### 15.7. Embedded objects

| Embedded object | Nằm trong | Ghi chú |
|---|---|---|
| Comment | Card | Lưu comment trực tiếp trong card |
| Checklist | Card | Một card có nhiều checklist |
| ChecklistItem | Checklist | Một checklist có nhiều item |
| BoardInvitation | Invitation | Lưu boardId và status lời mời |

## 16. API chính

### 16.1. Auth/User

| Method | Path | Mục đích | Auth | Quyền |
|---|---|---|---:|---|
| POST | `/v1/users/register` | Đăng ký user | Không | Guest |
| PUT | `/v1/users/verify` | Xác thực email | Không | Guest |
| POST | `/v1/users/login` | Đăng nhập | Không | Guest |
| DELETE | `/v1/users/logout` | Đăng xuất | Không bắt middleware | User đang có cookie |
| GET | `/v1/users/refresh_token` | Refresh access token | Refresh token cookie | User active, không blocked |
| PUT | `/v1/users/update` | Update displayName/password/avatar | Có | Chính user |

### 16.2. Board

| Method | Path | Mục đích | Auth | Quyền |
|---|---|---|---:|---|
| GET | `/v1/boards` | Danh sách board của user, search/pagination | Có | Owner/member |
| POST | `/v1/boards` | Tạo board | Có | User |
| GET | `/v1/boards/:id` | Chi tiết board | Có | Owner/member |
| PUT | `/v1/boards/:id` | Update board, columnOrderIds | Có | Owner |
| GET | `/v1/boards/:id/dashboard` | Dashboard board | Có | Owner/member |
| PUT | `/v1/boards/supports/moving_card` | Move card sang column khác | Có | Owner/member |

### 16.3. Column

| Method | Path | Mục đích | Auth | Quyền |
|---|---|---|---:|---|
| POST | `/v1/columns` | Tạo column | Có | Board Owner |
| PUT | `/v1/columns/:id` | Đổi tên hoặc update cardOrderIds | Có | Owner cho rename, owner/member cho reorder card |
| DELETE | `/v1/columns/:id` | Xóa column và cards | Có | Board Owner |

### 16.4. Card

| Method | Path | Mục đích | Auth | Quyền |
|---|---|---|---:|---|
| POST | `/v1/cards` | Tạo card | Có | Board owner/member |
| PUT | `/v1/cards/:id` | Update card fields, cover, comment, members, checklist | Có | Board owner/member |
| GET | `/v1/cards/:id/activities` | Lấy activity log của card | Có | Board owner/member |

### 16.5. Invitation

| Method | Path | Mục đích | Auth | Quyền |
|---|---|---|---:|---|
| POST | `/v1/invitations/board` | Mời user vào board | Có | Board Owner |
| GET | `/v1/invitations` | Lấy invitation của user hiện tại | Có | Invitee/current user |
| PUT | `/v1/invitations/board/:invitationId` | Accept/reject lời mời | Có | Invitee |

### 16.6. Admin

| Method | Path | Mục đích | Auth | Quyền |
|---|---|---|---:|---|
| GET | `/v1/admin/dashboard` | Thống kê hệ thống | Có | System Admin |
| GET | `/v1/admin/users` | Danh sách user | Có | System Admin |
| GET | `/v1/admin/users/:id` | Chi tiết user | Có | System Admin |
| PUT | `/v1/admin/users/:id/status` | Block/unblock user | Có | System Admin |
| PUT | `/v1/admin/users/:id/role` | Đổi role user | Có | System Admin; backend có, frontend chưa expose |
| GET | `/v1/admin/boards` | Danh sách board toàn hệ thống | Có | System Admin |

### 16.7. Status

| Method | Path | Mục đích | Auth | Quyền |
|---|---|---|---:|---|
| GET | `/v1/status` | Health/status API v1 | Không | Public |

## 17. Luồng nghiệp vụ quan trọng

### 17.1. Đăng ký và xác thực email

1. Guest mở `/register`.
2. Nhập email, password, password confirmation.
3. Frontend validate bằng React Hook Form.
4. Gọi `POST /v1/users/register`.
5. Backend tạo user inactive, gửi email verify.
6. User click link email.
7. Frontend route `/account/verification` gọi `PUT /v1/users/verify`.
8. Backend active tài khoản.
9. Frontend chuyển về login kèm thông báo verified email.

### 17.2. Đăng nhập

1. User mở `/login`.
2. Nhập email/password.
3. Gọi `POST /v1/users/login`.
4. Backend kiểm tra active/blocked/password.
5. Backend set accessToken/refreshToken cookie.
6. Frontend lưu current user vào Redux.
7. Nếu role `system_admin`, chuyển `/admin/dashboard`; ngược lại `/boards`.

### 17.3. Tạo board

1. User mở `/boards`.
2. Click `Create a new board`.
3. Nhập title, description, chọn public/private.
4. Gọi `POST /v1/boards`.
5. Backend tạo board, set ownerIds gồm user hiện tại.
6. Frontend fetch lại danh sách board.

### 17.4. Mời thành viên vào board

1. Board Owner mở board detail.
2. Click `Invite`.
3. Nhập email invitee.
4. Gọi `POST /v1/invitations/board`.
5. Backend tạo invitation pending.
6. Frontend emit socket `FE_USER_INVITED_TO_BOARD`.
7. Backend broadcast `BE_USER_INVITED_TO_BOARD`.
8. Invitee đang online nhận notification.
9. Invitee accept/reject.
10. Nếu accept, backend push invitee vào `board.memberIds`, frontend navigate vào board.

### 17.5. Tạo column

1. Board Owner click `Add new column`.
2. Nhập title.
3. Gọi `POST /v1/columns`.
4. Backend tạo column và push id vào `board.columnOrderIds`.
5. Frontend cập nhật Redux board, thêm column mới.

### 17.6. Tạo card

1. Owner/member click `Add new card` trong column.
2. Nhập title.
3. Gọi `POST /v1/cards`.
4. Backend tạo card với status/priority mặc định.
5. Backend push id vào `column.cardOrderIds`.
6. Backend ghi `CARD_CREATED`.
7. Frontend cập nhật column cards.

### 17.7. Cập nhật card thành task đầy đủ

1. User click card mở modal.
2. Cập nhật title, description Markdown.
3. Chọn status, priority.
4. Set start date/due date.
5. Upload cover nếu cần.
6. Add members.
7. Add checklist và tick item.
8. Add comment.
9. Mỗi update gọi `PUT /v1/cards/:id`, backend update card và ghi log phù hợp.

### 17.8. Kéo thả card

Trong cùng column:

1. User kéo card đổi vị trí.
2. Frontend reorder list.
3. Gọi `PUT /v1/columns/:id` update `cardOrderIds`.

Sang column khác:

1. User kéo card sang column khác.
2. Frontend cập nhật state hiển thị.
3. Gọi `PUT /v1/boards/supports/moving_card`.
4. Backend update hai column và card.columnId.
5. Backend ghi `CARD_MOVED`.

### 17.9. Thêm checklist và tick item

1. User mở card modal.
2. Click Checklist/Add.
3. Gửi `checklistToAdd`.
4. Add item bằng `checklistItemToAdd`.
5. Tick item bằng `checklistItemToToggle`.
6. Backend cập nhật embedded checklist và ghi activity log.
7. Frontend hiển thị progress bar và badge ngoài card.

### 17.10. Xem dashboard board

1. User trong board click `Dashboard`.
2. Frontend gọi `GET /v1/boards/:id/dashboard`.
3. Backend aggregate cards trong board.
4. Frontend render stat cards, chart, overdue/due soon list, workload.

### 17.11. Lọc card theo dashboard/filter

1. User click overdue/due soon trong dashboard hoặc mở filter panel.
2. Frontend set filter state.
3. Board chuyển về Kanban và chỉ hiển thị card match.
4. Drag-drop bị disabled khi filter active.
5. User clear filters để quay về board đầy đủ.

### 17.12. Admin quản lý user

1. System Admin mở `/admin/users`.
2. Search hoặc phân trang danh sách user.
3. Click Block/Unblock.
4. Nếu block, nhập reason.
5. Gọi `PUT /v1/admin/users/:id/status`.
6. Backend kiểm tra không tự block chính mình, update user.
7. Frontend cập nhật row và toast.

## 18. Các diagram cần vẽ cho báo cáo

### 18.1. Use Case tổng quát

- Mục đích: mô tả chức năng chính của toàn hệ thống.
- Actor: Guest, User, Board Owner, Board Member, System Admin.
- Use case: register, verify, login, manage board, invite member, manage column, manage card, checklist, comment, view dashboard, manage users.
- Ghi chú: không đưa Viewer/Board Admin riêng vì source không có.

### 18.2. Use Case xác thực

- Actor: Guest, User.
- Use case: register, verify email, login, refresh session, logout, update profile, change password, upload avatar.
- Luồng chính: email/password -> verify -> login -> cookie JWT.

### 18.3. Use Case quản lý board

- Actor: User, Board Owner, Board Member.
- Use case: create board, view board list, search board, view board detail, update board, invite member, accept invitation, view members.
- Ghi chú: update/invite chỉ owner.

### 18.4. Use Case quản lý card/task

- Actor: Board Owner, Board Member.
- Use case: create card, update title/description, status, priority, dates, cover, comment, join/leave, assign member, checklist, drag-drop.
- Ghi chú: không vẽ delete/archive card là đã triển khai.

### 18.5. Class Diagram / Domain Model

- Class/entity: User, Board, Column, Card, Invitation, ActivityLog, Comment, Checklist, ChecklistItem.
- Quan hệ: User owns Boards, Board has Columns, Column has Cards, Card has Comments/Checklists/ActivityLogs.
- Ghi chú: MongoDB dùng embedded object cho Comment/Checklist.

### 18.6. Sequence Diagram đăng ký/xác thực

- Lifeline: Guest, React Auth Page, User API, UserService, UserModel, BrevoProvider, MongoDB.
- Luồng: submit register -> create user -> send email -> verify link -> update active.

### 18.7. Sequence Diagram tạo board

- Lifeline: User, Boards Page, Board API, AuthMiddleware, BoardService, BoardModel, MongoDB.
- Luồng: submit board -> validate -> create board -> ownerIds -> return board.

### 18.8. Sequence Diagram tạo card

- Lifeline: Board Member, Column UI, Card API, CardService, BoardModel, ColumnModel, CardModel, ActivityLogService.
- Luồng: add card -> check board/column/permission -> insert card -> push cardOrderIds -> log created.

### 18.9. Sequence Diagram kéo thả card

- Lifeline: User, BoardContent, Board API, BoardService, ColumnModel, CardModel, ActivityLogService.
- Luồng: drag end -> moving_card -> update prev column -> update next column -> update card.columnId -> log moved.

### 18.10. Sequence Diagram activity log

- Lifeline: User, ActiveCard Modal, Card API, CardService, ActivityLogService, ActivityLogModel.
- Luồng: update status/checklist/comment -> update card -> safeRecord -> insert activityLogs.

### 18.11. Sequence Diagram dashboard

- Lifeline: User, BoardDashboard, Board API, BoardService, CardModel, MongoDB.
- Luồng: open dashboard -> permission check -> aggregate card stats -> render chart.

### 18.12. Activity Diagram quy trình quản lý công việc

- Swimlane: Board Owner/Member.
- Flow: create board -> create column -> create card -> assign member -> set status/priority/date -> checklist -> move card -> complete.

### 18.13. Activity Diagram mời thành viên

- Flow: owner nhập email -> backend tạo invitation -> socket notification -> invitee accept/reject -> nếu accept thêm vào memberIds.

### 18.14. Activity Diagram filter/dashboard drill-down

- Flow: xem dashboard -> click overdue/due soon -> set filter -> quay Kanban -> disable drag-drop -> clear filters.

### 18.15. ERD/Database relationship

- Dù MongoDB không phải relational DB, nên vẽ ERD/domain relationship để giải thích ObjectId references và embedded objects.
- Ghi chú rõ embedded `comments`, `checklists`, `checklistItems`.

## 19. Gợi ý cấu trúc báo cáo tốt nghiệp

### Lời cảm ơn

- Cảm ơn giảng viên hướng dẫn, khoa, trường, gia đình, bạn bè.
- Không lấy từ source; viết bổ sung.

### Mục lục

- Sinh tự động từ file Word/LaTeX.
- Không lấy từ source.

### Danh mục hình ảnh/bảng biểu

- Liệt kê UI screenshot, diagram, bảng test case, bảng API.
- Cần bổ sung sau khi hoàn thiện báo cáo.

### Chương 1: Tổng quan đề tài

Nên có:

- Lý do chọn đề tài.
- Mục tiêu đề tài.
- Đối tượng và phạm vi nghiên cứu.
- Phương pháp thực hiện.
- Ý nghĩa thực tiễn.

Lấy từ project hiện tại:

- Mô hình Kanban, board/column/card.
- Dashboard, checklist, activity log, admin.

Cần bổ sung sau:

- Bối cảnh thực tế quản lý công việc.
- Vấn đề của quản lý thủ công hoặc Kanban đơn giản.
- Phạm vi AI nếu chưa triển khai.

### Chương 2: Cơ sở lý thuyết và công nghệ sử dụng

Nên có:

- Mô hình Kanban.
- REST API.
- Client-server architecture.
- JWT authentication.
- MongoDB document model.
- React, Node.js, Express.
- Recharts/dashboard.
- Drag-drop với dnd-kit.
- Định hướng AI hỗ trợ quản lý công việc.

Lấy từ project hiện tại:

- Stack công nghệ ở mục 2.
- Auth JWT/cookie.
- MongoDB collections.

Cần bổ sung sau:

- Tài liệu tham khảo chính thức.
- Lý thuyết AI nếu triển khai sau.

### Chương 3: Phân tích và thiết kế hệ thống

Nên có:

- Actor/role.
- Use case.
- Phân quyền.
- Luồng nghiệp vụ.
- Class/domain model.
- ERD hoặc database relationship.
- API design.

Lấy từ project hiện tại:

- Mục 4, 5, 15, 16, 17, 18.

Cần bổ sung sau:

- Diagram vẽ bằng PlantUML/Draw.io.
- Đặc tả chi tiết use case theo template trường.

### Chương 4: Xây dựng và triển khai hệ thống

Nên có:

- Kiến trúc source.
- Backend routes/controllers/services/models.
- Frontend pages/components/redux/apis.
- Các chức năng đã triển khai.
- Môi trường chạy.

Lấy từ project hiện tại:

- Mục 3, 6-14, 23.

Cần bổ sung sau:

- Screenshot giao diện thực tế.
- Mô tả deployment nếu có.

### Chương 5: Kiểm thử và đánh giá

Nên có:

- Test case chức năng.
- Test phân quyền.
- Test API.
- Test UI/UX cơ bản.
- Đánh giá kết quả.

Lấy từ project hiện tại:

- Mục 22.

Cần bổ sung sau:

- Kết quả chạy test thực tế.
- Screenshot minh chứng.
- Bug/issue nếu có.

### Chương 6: Kết luận và hướng phát triển

Nên có:

- Kết quả đạt được.
- Hạn chế.
- Hướng phát triển.
- Định hướng tích hợp AI.

Lấy từ project hiện tại:

- Mục 20, 21.

Cần bổ sung sau:

- Đánh giá định lượng nếu có.
- Kế hoạch triển khai AI cụ thể.

### Tài liệu tham khảo

Nên tham khảo:

- React, Vite, MUI, Redux Toolkit, React Router.
- Node.js, Express, MongoDB.
- JWT, Cloudinary, Brevo.
- dnd-kit, Recharts.
- Kanban và quản lý dự án.
- AI/LLM nếu phát triển.

### Phụ lục

Nên có:

- Danh sách API chi tiết.
- Biến môi trường.
- Test case đầy đủ.
- Một số đoạn mã quan trọng.

## 20. Đánh giá mức độ hoàn thiện của project

### 20.1. Những chức năng đã hoàn thành

- Auth đầy đủ: register, email verification, login, refresh token, logout.
- Profile settings: đổi display name, đổi password, upload avatar.
- Board list, search, create board.
- Board detail với Kanban drag-drop.
- Board owner/member permission.
- Invitation và notification realtime cho lời mời board.
- Column CRUD cơ bản: create, rename, delete, reorder.
- Card/task: create, update title/description/status/priority/dates/cover, comments, members, join/leave.
- Checklist nhiều checklist và nhiều item.
- Activity log collection riêng và UI system log.
- Board dashboard.
- Admin dashboard, users, boards.
- Block/unblock user.

### 20.2. Điểm mạnh

- Có tách tầng backend tương đối rõ: routes/controllers/services/models/validations/middlewares.
- Có phân quyền board owner/member ở backend, không chỉ ẩn UI.
- Auth dùng httpOnly cookie và refresh token interceptor.
- Card được mở rộng thành task có nhiều thuộc tính quản lý công việc.
- Dashboard có aggregate backend, không chỉ tính toàn bộ ở frontend.
- Checklist và activity log tạo dữ liệu tốt cho báo cáo và phân tích công việc.
- Có guard System Admin cả frontend và backend.

### 20.3. Hạn chế

- Tên hệ thống chưa thống nhất (`TaskFlowDdow`, `TaskFlow_Final_Project`, package description).
- Frontend admin chỉ kiểm tra `system_admin`, backend chấp nhận legacy `admin`; cần thống nhất nếu còn dữ liệu cũ.
- Backend có API đổi role user nhưng frontend chưa có UI tương ứng.
- Board `public/private` hiện chủ yếu là metadata, chưa ảnh hưởng quyền truy cập.
- Chưa có API xóa/archive/restore card.
- Column delete đang xóa cứng column và cards.
- Chưa có attachment/label dù UI có mục coming soon.
- Chưa có realtime đồng bộ thao tác board/card, chỉ realtime notification invitation.
- Chưa thấy test tự động trong source.
- Chưa có AI trong source.

### 20.4. Rủi ro kỹ thuật

- Nếu activity log ghi lỗi thì nghiệp vụ vẫn thành công; điều này tốt cho trải nghiệm nhưng có thể mất log nếu lỗi không được xử lý sau đó.
- Comment embedded trong card có thể làm document card lớn nếu quá nhiều comment.
- Card checklist embedded cũng có giới hạn hợp lý nhưng vẫn cần theo dõi kích thước document.
- Không có token blacklist nên logout chỉ clear cookie phía client; nếu token bị lộ trước khi hết hạn thì chưa có cơ chế revoke server-side.
- Cookie set `secure: true`, `sameSite: none`; môi trường local HTTP cần kiểm tra trình duyệt/cấu hình thực tế.
- Build backend dùng script `clean` với `rm -rf`, có thể không chạy trực tiếp trên PowerShell Windows nếu không có môi trường hỗ trợ lệnh Unix.

### 20.5. Hướng phát triển

- Tích hợp AI theo mục 21.
- Hoàn thiện labels, attachments.
- Archive/restore card/column/board.
- Realtime collaboration cho board/card.
- Notification cho comment/mention/due date.
- Role board chi tiết hơn nếu cần: viewer, board admin.
- Test tự động backend/frontend.
- Audit log cho admin actions.
- Server-side card filter/search nếu board lớn.

## 21. AI integration

### 21.1. Source hiện tại đã có AI chưa

**Chưa thấy AI được triển khai trong source hiện tại.**

Không thấy module, provider, endpoint hoặc dependency liên quan OpenAI/LLM/AI trong `src` của frontend/backend. Vì vậy trong báo cáo phải ghi rõ phần AI là **định hướng tích hợp AI** hoặc **chức năng dự kiến phát triển**, không ghi là đã hoàn thành.

### 21.2. Dữ liệu hiện có phù hợp cho AI

Source hiện đã có dữ liệu nền tốt để tích hợp AI sau này:

- Board, column, card.
- Status, priority, due date, start date.
- CompletedAt, lastActivityAt.
- Member workload qua `memberIds`.
- Checklist progress.
- Comments.
- Activity logs.
- Dashboard metrics.

### 21.3. Định hướng tích hợp AI hợp lý

Đề xuất:

1. **AI tóm tắt tình trạng board**
   - Input: dashboard metrics, overdue/due soon list, cards by status/priority, recent activity logs.
   - Output: đoạn tóm tắt tiến độ, rủi ro, điểm cần chú ý.

2. **AI phát hiện card rủi ro trễ hạn**
   - Input: dueDate, status, priority, lastActivityAt, checklist progress, comments gần nhất.
   - Output: risk score và lý do.

3. **AI gợi ý ưu tiên công việc**
   - Input: priority hiện tại, due date, overdue/due soon, workload, status.
   - Output: đề xuất card cần xử lý trước.

4. **AI phân tích workload thành viên**
   - Input: member workload, số card overdue/due soon theo member, priority.
   - Output: nhận xét ai đang quá tải, ai có thể nhận thêm việc.

5. **AI tạo báo cáo tiến độ từ activity logs**
   - Input: activityLogs theo board/card trong khoảng thời gian.
   - Output: báo cáo tuần/ngày về việc đã làm, việc bị trễ, thay đổi quan trọng.

### 21.4. Đề xuất API/luồng tích hợp AI ở mức thiết kế

API dự kiến, chưa có trong source:

| Method | Path dự kiến | Mục đích | Quyền |
|---|---|---|---|
| GET | `/v1/boards/:id/ai/summary` | Tóm tắt tình trạng board | Board owner/member |
| GET | `/v1/boards/:id/ai/risks` | Phân tích card rủi ro trễ hạn | Board owner/member |
| GET | `/v1/boards/:id/ai/workload` | Nhận xét workload thành viên | Board owner/member |
| POST | `/v1/cards/:id/ai/suggestions` | Gợi ý cải thiện task/checklist | Board owner/member |
| GET | `/v1/boards/:id/ai/report?from=&to=` | Tạo báo cáo tiến độ | Board owner/member |

Luồng thiết kế:

1. Frontend gọi AI API.
2. Backend kiểm tra auth và quyền board.
3. Backend aggregate dữ liệu cần thiết từ MongoDB.
4. Backend gọi AI provider.
5. Backend lưu hoặc trả kết quả.
6. Frontend hiển thị AI summary/risk/report.

### 21.5. Phân biệt rõ đã triển khai và định hướng

Đã triển khai:

- Dashboard metrics.
- Activity log.
- Checklist progress.
- Workload.
- Due soon/overdue.

Định hướng phát triển:

- AI summary.
- AI risk detection.
- AI priority recommendation.
- AI workload analysis.
- AI progress report.

## 22. Kiểm thử

Trạng thái trong các bảng dưới đây là **Đề xuất** vì source hiện chưa thấy test tự động.

### 22.1. Auth

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| AUTH-01 | Đăng ký tài khoản hợp lệ | Nhập email/password hợp lệ, submit register | User được tạo inactive, email verify được gửi | Đề xuất |
| AUTH-02 | Chặn đăng nhập khi chưa verify | Register xong, login ngay | API trả lỗi tài khoản chưa active | Đề xuất |
| AUTH-03 | Verify email | Mở link có email/token đúng | `isActive=true`, chuyển về login | Đề xuất |
| AUTH-04 | Refresh token | Làm access token hết hạn, gọi API protected | Frontend gọi refresh và retry request | Đề xuất |
| AUTH-05 | Logout | Click logout | Cookie bị clear, Redux currentUser null | Đề xuất |

### 22.2. Permission

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| PER-01 | User ngoài board không xem được board | User A tạo board, User B gọi detail board | API trả not found/forbidden | Đề xuất |
| PER-02 | Member không được tạo column | Owner mời member, member gọi create column | API trả forbidden | Đề xuất |
| PER-03 | Member được tạo card | Member vào board, tạo card | Card được tạo | Đề xuất |
| PER-04 | Non-admin không vào admin route | User thường mở `/admin/dashboard` | Redirect `/boards`, backend admin API forbidden | Đề xuất |

### 22.3. Board

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| BOARD-01 | Tạo board | Submit title/description/type | Board tạo thành công, user là owner | Đề xuất |
| BOARD-02 | Search board | Nhập từ khóa ở AppBar search | Chỉ board match và user có quyền hiển thị | Đề xuất |
| BOARD-03 | Update board | Owner đổi title/description | Board cập nhật | Đề xuất |
| BOARD-04 | Invite member | Owner mời email user khác | Invitation pending được tạo, invitee thấy notification | Đề xuất |

### 22.4. Column

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| COL-01 | Tạo column | Owner add column | Column xuất hiện, board.columnOrderIds cập nhật | Đề xuất |
| COL-02 | Đổi tên column | Owner rename column | Title column cập nhật | Đề xuất |
| COL-03 | Xóa column | Owner xóa column có card | Column và cards trong column bị xóa | Đề xuất |
| COL-04 | Reorder column | Owner kéo column | columnOrderIds cập nhật | Đề xuất |

### 22.5. Card

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| CARD-01 | Tạo card | Add card trong column | Card có status TODO, priority MEDIUM | Đề xuất |
| CARD-02 | Update title/description | Sửa title và Markdown description | Card cập nhật, UI hiển thị đúng | Đề xuất |
| CARD-03 | Upload cover | Chọn file jpg/png dưới 10MB | Cover upload Cloudinary và hiển thị | Đề xuất |
| CARD-04 | Move card same column | Kéo card đổi vị trí | cardOrderIds column cập nhật | Đề xuất |
| CARD-05 | Move card khác column | Kéo card sang column khác | card.columnId đổi, log CARD_MOVED | Đề xuất |
| CARD-06 | Update status done | Chọn DONE | completedAt được set, card preview gạch title | Đề xuất |

### 22.6. Checklist

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| CL-01 | Thêm checklist | Add checklist title hợp lệ | Checklist tạo, log CHECKLIST_CREATED | Đề xuất |
| CL-02 | Thêm item | Add item vào checklist | Item tạo, progress cập nhật | Đề xuất |
| CL-03 | Tick/untick item | Tick rồi untick | isCompleted/completedAt cập nhật đúng | Đề xuất |
| CL-04 | Giới hạn checklist | Tạo quá 5 checklist | API trả lỗi giới hạn | Đề xuất |
| CL-05 | Giới hạn item | Tạo quá 20 item | API trả lỗi giới hạn | Đề xuất |

### 22.7. Activity Log

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| LOG-01 | Ghi log tạo card | Tạo card mới | Có log CARD_CREATED | Đề xuất |
| LOG-02 | Ghi log đổi status/priority | Đổi status/priority | Có log tương ứng với metadata from/to | Đề xuất |
| LOG-03 | Lấy system log loại comment | Gọi activities với excludeCommentCreated=true | Không có COMMENT_CREATED trong result | Đề xuất |
| LOG-04 | Phân quyền log | User ngoài board gọi activities | API chặn | Đề xuất |

### 22.8. Dashboard

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| DASH-01 | Admin dashboard | Admin mở `/admin/dashboard` | Hiển thị total users/boards/cards | Đề xuất |
| DASH-02 | Board dashboard | Member mở dashboard board | Chart và stat hiển thị đúng | Đề xuất |
| DASH-03 | Overdue count | Tạo card dueDate quá khứ, chưa DONE | overdue count tăng | Đề xuất |
| DASH-04 | Checklist avg | Tạo checklist có item hoàn thành | averageChecklistProgress đúng | Đề xuất |

### 22.9. Filter

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| FIL-01 | Search title | Nhập keyword | Chỉ card có title match hiển thị | Đề xuất |
| FIL-02 | Filter AND | Chọn status + priority | Chỉ card thỏa cả hai điều kiện | Đề xuất |
| FIL-03 | Assigned to me | Bật assigned to me | Chỉ card có current user trong memberIds | Đề xuất |
| FIL-04 | Disable drag | Bật filter rồi thử kéo card | Drag/drop bị disable | Đề xuất |

### 22.10. Admin

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| ADM-01 | Admin list users | Mở admin users | Danh sách user phân trang | Đề xuất |
| ADM-02 | Block user | Admin block user khác | User bị block, không login/API được | Đề xuất |
| ADM-03 | Không tự block | Admin block chính mình | API trả forbidden | Đề xuất |
| ADM-04 | Admin boards | Mở admin boards | Xem danh sách board toàn hệ thống | Đề xuất |

### 22.11. Security/access control và UI/UX

| Mã test | Mục tiêu | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| SEC-01 | Upload sai định dạng | Upload file PDF làm avatar/cover | Frontend/backend chặn | Đề xuất |
| SEC-02 | Date invalid | Set startDate sau dueDate | API trả lỗi validation | Đề xuất |
| SEC-03 | Markdown sanitize | Nhập script trong description | Script không thực thi ở preview | Đề xuất |
| UX-01 | Empty board/column | Tạo board/column rỗng | UI không crash, placeholder card ẩn | Đề xuất |
| UX-02 | Pagination comment/log | Tạo nhiều comment/log | Pagination hoạt động đúng | Đề xuất |

## 23. Triển khai/môi trường

### 23.1. Cách chạy frontend

Thư mục: `final-full-stack-mern-advanced-web`.

Lệnh theo `package.json`:

```bash
yarn install
yarn dev
```

Hoặc:

```bash
npm install
npm run dev
```

Script frontend:

- `dev`: `cross-env BUILD_MODE=dev vite --host`
- `build`: `cross-env BUILD_MODE=production vite build --base=./`
- `lint`: `eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0`
- `preview`: `vite preview`

Frontend dev dùng `API_ROOT = http://localhost:8017` khi `BUILD_MODE=dev`.

### 23.2. Cách chạy backend

Thư mục: `final-full-stack-mern-advanced-api`.

Lệnh theo `package.json`:

```bash
yarn install
yarn dev
```

Hoặc:

```bash
npm install
npm run dev
```

Script backend:

- `dev`: `cross-env BUILD_MODE=dev nodemon --exec babel-node ./src/server.js`
- `lint`: `eslint src --ext js --report-unused-disable-directives --max-warnings 0`
- `build`: `npm run clean && npm run build-babel`
- `production`: `npm run build && cross-env BUILD_MODE=production node ./build/src/server.js`

Lưu ý: script `clean` dùng `rm -rf build && mkdir build`, có thể cần môi trường hỗ trợ lệnh Unix nếu chạy trên Windows PowerShell.

### 23.3. Biến môi trường backend

Theo `.env.example`:

| Biến | Ý nghĩa |
|---|---|
| `MONGODB_URI` | URI MongoDB/Atlas |
| `DATABASE_NAME` | Tên database |
| `LOCAL_DEV_APP_HOST` | Host backend local, ví dụ `localhost` |
| `LOCAL_DEV_APP_PORT` | Port backend local, ví dụ `8017` |
| `AUTHOR` | Tên author hiển thị log |
| `WEBSITE_DOMAIN_DEVELOPMENT` | Domain frontend dev, ví dụ `http://localhost:5173` |
| `WEBSITE_DOMAIN_PRODUCTION` | Domain frontend production |
| `BREVO_API_KEY` | API key Brevo |
| `ADMIN_EMAIL_ADDRESS` | Email sender Brevo |
| `ADMIN_EMAIL_NAME` | Tên sender |
| `ACCESS_TOKEN_SECRET_SIGNATURE` | Secret access token |
| `ACCESS_TOKEN_LIFE` | Thời gian sống access token |
| `REFRESH_TOKEN_SECRET_SIGNATURE` | Secret refresh token |
| `REFRESH_TOKEN_LIFE` | Thời gian sống refresh token |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud |
| `CLOUDINARY_API_KEY` | Cloudinary key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |

### 23.4. MongoDB

Backend kết nối MongoDB bằng `MongoClient`. Cần đảm bảo:

- `MONGODB_URI` hợp lệ.
- IP/network được phép nếu dùng MongoDB Atlas.
- Database name đúng.
- Các collection sẽ được tạo khi insert dữ liệu.

### 23.5. Email service

Brevo cần:

- API key.
- Sender email/name hợp lệ.
- Cấu hình domain/IP theo chính sách Brevo nếu cần.

### 23.6. Cloudinary

Cloudinary cần:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Upload folder đang dùng:

- `users` cho avatar.
- `card-covers` cho cover card.

## 24. Nội dung cần tránh khi viết báo cáo

Không nên viết:

- AI đã triển khai trong source.
- Realtime board/card collaboration đã có.
- Archive/restore card đã có.
- Attachment/label đã hoàn thành.
- Viewer hoặc Board Admin là role chính thức.
- Public board cho phép mọi user xem.
- Admin frontend đã có đổi role user.
- Có test tự động nếu chưa bổ sung.
- Có API lấy chi tiết card riêng nếu không thêm sau.

Nên viết:

- AI là định hướng tích hợp hoặc chức năng dự kiến phát triển.
- Realtime hiện có ở notification invitation qua Socket.IO.
- Board public/private hiện là metadata hiển thị, chưa dùng để mở quyền truy cập.
- Source hiện có dashboard, checklist, activity log và admin management ở mức đã mô tả.

## 25. Tóm tắt "Đã triển khai" và "Định hướng phát triển"

### 25.1. Đã triển khai

- Frontend React/Vite/MUI.
- Backend Node.js/Express/MongoDB.
- Auth JWT cookie + refresh token.
- Email verification bằng Brevo.
- Upload avatar/card cover bằng Cloudinary.
- Board/column/card Kanban.
- Drag-drop bằng dnd-kit.
- Board invitation + realtime notification invitation.
- Board owner/member permission.
- Card/task status, priority, dates, completedAt, lastActivityAt, createdBy.
- Comments.
- Multiple checklists.
- Activity log collection riêng.
- Board dashboard bằng aggregate + Recharts.
- Admin dashboard/users/boards.
- Admin block/unblock user.
- Filter/search card trong board.

### 25.2. Định hướng phát triển

- AI tóm tắt board.
- AI phát hiện rủi ro trễ hạn.
- AI gợi ý ưu tiên công việc.
- AI phân tích workload.
- AI tạo báo cáo tiến độ từ activity logs.
- Labels.
- Attachments.
- Archive/restore.
- Realtime collaboration cho board/card.
- Test tự động.
- Role board nâng cao nếu cần.

