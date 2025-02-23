"use client";
// WARNING! The code might contain errors because it's taken from a package.
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const { data: user, loading } = useUser();
  const [balance, setBalance] = useState(1000000);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showBuyersList, setShowBuyersList] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [showCustomerChat, setShowCustomerChat] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerMessages, setCustomerMessages] = useState([]);
  const [showDonate, setShowDonate] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [donateAmount, setDonateAmount] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    photoUrl: "",
    cardNumber: "",
  });
  const [upload, { loading: uploadLoading }] = useUpload();
  const [searchTerm, setSearchTerm] = useState("");
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const photo = formData.get("photo");

    try {
      let photoUrl = profileData.photoUrl;

      if (photo.size > 0) {
        const { url, error } = await upload({ file: photo });
        if (error) {
          throw new Error(error);
        }
        photoUrl = url;
      }

      const response = await fetch("/api/db/sup-bank-users", {
        method: "POST",
        body: JSON.stringify({
          query:
            "INSERT INTO `users` (`name`, `photo_url`, `user_id`) VALUES (?, ?, ?)",
          values: [name, photoUrl, user.id],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      setProfileData({
        name,
        photoUrl,
      });

      setShowEditProfile(false);
      setNotification("Профиль успешно обновлен");
      setShowNotification(true);
    } catch (error) {
      console.error(error);
      setNotification("Ошибка при сохранении профиля");
      setShowNotification(true);
    }
  };
  const handleShowBuyersList = () => {
    setShowBuyersList(true);
  };
  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      text: currentMessage,
      sender: user.id,
      senderName: profileData.name,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setCurrentMessage("");
  };
  const handleSendCustomerMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      text: currentMessage,
      sender: user.id,
      senderName: profileData.name,
      timestamp: new Date().toISOString(),
    };

    setCustomerMessages([...customerMessages, newMessage]);
    setCurrentMessage("");
  };
  const handleChatWithSeller = (item) => {
    setSelectedSeller(item);
    setShowChat(true);
  };
  const handleBuyProduct = async (item) => {
    try {
      const response = await fetch("/api/db/sup-bank-users", {
        method: "POST",
        body: JSON.stringify({
          query:
            "INSERT INTO `purchased_items` (`user_id`, `product_id`) VALUES (?, ?)",
          values: [user.id, item.id],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to purchase item");
      }

      setNotification("Товар успешно куплен");
      setShowNotification(true);
      fetchPurchasedItems();
    } catch (error) {
      console.error(error);
      setNotification("Ошибка при покупке товара");
      setShowNotification(true);
    }
  };
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const price = formData.get("price");

    try {
      const response = await fetch("/api/db/sup-bank-users", {
        method: "POST",
        body: JSON.stringify({
          query:
            "INSERT INTO `products` (`name`, `price`, `seller_id`, `seller_name`) VALUES (?, ?, ?, ?)",
          values: [name, price, user.id, profileData.name],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      setShowAddProduct(false);
      setNotification("Товар успешно добавлен");
      setShowNotification(true);
      fetchProducts();
    } catch (error) {
      console.error(error);
      setNotification("Ошибка при добавлении товара");
      setShowNotification(true);
    }
  };
  const handleDonate = async () => {
    if (!selectedReceiver || !donateAmount || donateAmount <= 0) return;

    try {
      setNotification("Донат успешно отправлен");
      setShowNotification(true);
      setShowDonate(false);
      setSelectedReceiver(null);
      setDonateAmount("");
    } catch (error) {
      console.error(error);
      setNotification("Ошибка при отправке доната");
      setShowNotification(true);
    }
  };
  const handleSellPurchasedItem = async (item) => {
    try {
      const response = await fetch("/api/db/sup-bank-users", {
        method: "POST",
        body: JSON.stringify({
          query:
            "DELETE FROM `purchased_items` WHERE `id` = ? AND `user_id` = ?",
          values: [item.purchase_id, user.id],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to return item");
      }

      setNotification("Товар успешно возвращен");
      setShowNotification(true);
      fetchPurchasedItems();
    } catch (error) {
      console.error(error);
      setNotification("Ошибка при возврате товара");
      setShowNotification(true);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/db/sup-bank-users", {
        method: "POST",
        body: JSON.stringify({
          query: "SELECT * FROM `products`",
        }),
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/db/sup-bank-users", {
        method: "POST",
        body: JSON.stringify({
          query: "SELECT * FROM `users`",
        }),
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
        setBuyers(data.filter((u) => u.user_id !== user?.id));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetch("/api/db/sup-bank-users", {
        method: "POST",
        body: JSON.stringify({
          query: "SELECT `name`, `photo_url` FROM `users` WHERE `user_id` = ?",
          values: [user.id],
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            setProfileData({
              name: data[0].name,
              photoUrl: data[0].photo_url,
            });
          }
        });

      fetchProducts();
      fetchPurchasedItems();
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const fetchPurchasedItems = async () => {
    try {
      const response = await fetch("/api/db/sup-bank-users", {
        method: "POST",
        body: JSON.stringify({
          query: `
          SELECT p.*, pi.id as purchase_id 
          FROM products p 
          INNER JOIN purchased_items pi ON p.id = pi.product_id 
          WHERE pi.user_id = ?
        `,
          values: [user.id],
        }),
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setPurchasedItems(data);
      } else {
        setPurchasedItems([]);
        console.error("Received invalid data format:", data);
      }
    } catch (error) {
      console.error("Error fetching purchased items:", error);
      setPurchasedItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe]">
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
      {(showChat && selectedSeller) ||
      (showDonate && selectedReceiver) ||
      (showCustomerChat && selectedCustomer) ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#003366] font-montserrat">
                Чат с{" "}
                {selectedSeller
                  ? selectedSeller.seller_name
                  : selectedCustomer.name}
              </h2>
              <button
                onClick={() => {
                  setShowChat(false);
                  setShowCustomerChat(false);
                  setSelectedSeller(null);
                  setSelectedCustomer(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="h-64 border rounded-lg p-4 mb-4 overflow-y-auto">
              {(showChat ? messages : customerMessages).length === 0 ? (
                <div className="text-center text-gray-500">Начните общение</div>
              ) : (
                (showChat ? messages : customerMessages).map(
                  (message, index) => (
                    <div
                      key={index}
                      className={`mb-2 ${
                        message.sender === user.id ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block px-4 py-2 rounded-lg ${
                          message.sender === user.id
                            ? "bg-[#003366] text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <div className="text-sm font-bold mb-1">
                          {message.senderName}
                        </div>
                        {message.text}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    showChat
                      ? handleSendMessage()
                      : handleSendCustomerMessage();
                  }
                }}
                placeholder="Введите сообщение..."
                className="flex-1 p-2 border rounded-lg"
              />
              <button
                onClick={
                  showChat ? handleSendMessage : handleSendCustomerMessage
                }
                className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004488]"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showBuyersList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#003366] font-montserrat">
                Покупатели
              </h2>
              <button
                onClick={() => setShowBuyersList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              {buyers.map((buyer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedCustomer(buyer);
                    setShowCustomerChat(true);
                    setShowBuyersList(false);
                    setCustomerMessages([]);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {buyer.photo_url && (
                      <img
                        src={buyer.photo_url}
                        alt={`${buyer.name} фото`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>{buyer.name}</div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav className="bg-[#003366] p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-soup text-3xl text-white"></i>
            <span className="text-2xl font-bold text-white font-montserrat">
              СУП банк
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user && profileData.name && (
              <>
                <button
                  onClick={handleShowBuyersList}
                  className="text-white hover:text-[#ffd700]"
                >
                  <i className="fas fa-comments mr-2"></i>
                  Чат
                </button>
                <div
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
                  onClick={() => setShowEditProfile(true)}
                >
                  {profileData.photoUrl && (
                    <img
                      src={profileData.photoUrl}
                      alt="Фото профиля"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-white">{profileData.name}</span>
                </div>
              </>
            )}
            {!user ? (
              <a
                href="/account/signin"
                className="text-white hover:text-[#ffd700]"
              >
                <i className="fas fa-user mr-2"></i>
                Войти
              </a>
            ) : (
              <a
                href="/account/logout"
                className="text-white hover:text-[#ffd700]"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Выйти
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center">Загрузка...</div>
        ) : !user ? (
          <div className="text-center">
            <a
              href="/account/signin"
              className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004488]"
            >
              Войти в аккаунт
            </a>
          </div>
        ) : !profileData.name ? (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#003366] font-montserrat">
              Создание профиля
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Ваше имя"
                required
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full p-2 border rounded-lg"
              />
              <button
                type="submit"
                className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004488] w-full"
                disabled={uploadLoading}
              >
                {uploadLoading ? "Загрузка..." : "Сохранить"}
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {showEditProfile && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-[#003366] font-montserrat">
                      Редактировать профиль
                    </h2>
                    <button
                      onClick={() => setShowEditProfile(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Ваше имя"
                      defaultValue={profileData.name}
                      required
                      className="w-full p-2 border rounded-lg"
                    />
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      className="w-full p-2 border rounded-lg"
                    />
                    {profileData.photoUrl && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={profileData.photoUrl}
                          alt="Текущее фото профиля"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-500">
                          Текущее фото
                        </span>
                      </div>
                    )}
                    <button
                      type="submit"
                      className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004488] w-full"
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? "Загрузка..." : "Сохранить"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#003366] font-montserrat">
                Ваш баланс
              </h2>
              <div className="text-4xl font-bold text-[#003366] mb-4">
                {balance.toLocaleString()} ₽
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowTransfer(!showTransfer)}
                  className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004488] transition-colors"
                >
                  <i className="fas fa-exchange-alt mr-2"></i>
                  Перевести
                </button>
                <button
                  onClick={() => setShowDonate(true)}
                  className="bg-[#ffd700] text-[#003366] px-6 py-2 rounded-lg hover:bg-[#ffed4a] transition-colors"
                >
                  <i className="fas fa-gift mr-2"></i>
                  Донат
                </button>
              </div>
            </div>

            {showTransfer && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
                <h2 className="text-2xl font-bold mb-4 text-[#003366] font-montserrat">
                  Перевод средств
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Номер карты получателя"
                    className="w-full p-2 border rounded-lg"
                    name="cardNumber"
                  />
                  <input
                    type="number"
                    placeholder="Сумма перевода"
                    className="w-full p-2 border rounded-lg"
                    name="amount"
                  />
                  <button className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004488] transition-colors w-full">
                    Перевести
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-[#003366] font-montserrat">
                Последние операции
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <i className="fas fa-shopping-bag text-[#003366] mr-2"></i>
                    Магазин "Продукты"
                  </div>
                  <div className="text-red-500">-250 ₽</div>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <i className="fas fa-gift text-[#003366] mr-2"></i>
                    Кэшбэк
                  </div>
                  <div className="text-green-500">+150 ₽</div>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <i className="fas fa-subway text-[#003366] mr-2"></i>
                    Метро
                  </div>
                  <div className="text-red-500">-40 ₽</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#003366] font-montserrat mb-4 md:mb-0">
                  {showJobs
                    ? "Поиск работы"
                    : showShop
                    ? "Магазин"
                    : showInventory
                    ? "Купленные вещи"
                    : showDonate
                    ? "Отправить донат"
                    : ""}
                </h2>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                  {showShop && (
                    <input
                      type="text"
                      placeholder="Поиск товаров..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full md:w-64 p-2 border rounded-lg"
                    />
                  )}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShowJobs(true);
                        setShowShop(false);
                        setShowInventory(false);
                        setShowDonate(false);
                        setActiveTab("jobs");
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        activeTab === "jobs"
                          ? "bg-[#003366] text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Работа
                    </button>
                    <button
                      onClick={() => {
                        setShowShop(true);
                        setShowJobs(false);
                        setShowInventory(false);
                        setShowDonate(false);
                        setActiveTab("shop");
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        activeTab === "shop"
                          ? "bg-[#003366] text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Магазин
                    </button>
                    <button
                      onClick={() => {
                        setShowInventory(true);
                        setShowShop(false);
                        setShowJobs(false);
                        setShowDonate(false);
                        setActiveTab("inventory");
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        activeTab === "inventory"
                          ? "bg-[#003366] text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Купленные вещи
                    </button>
                  </div>
                </div>
              </div>

              {showJobs && (
                <div className="space-y-4">
                  <button className="bg-[#ffd700] text-[#003366] px-6 py-2 rounded-lg hover:bg-[#ffed4a] transition-colors w-full">
                    <i className="fas fa-plus-circle mr-2"></i>
                    Разместить вакансию
                  </button>
                  <div className="grid gap-4">
                    {[
                      {
                        title: "Дизайнер",
                        salary: "50,000 ₽",
                        company: "Студия дизайна",
                      },
                      {
                        title: "Программист",
                        salary: "120,000 ₽",
                        company: "IT компания",
                      },
                    ].map((job, index) => (
                      <div key={index} className="border p-4 rounded-lg">
                        <h3 className="font-bold">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                        <p className="text-[#003366] font-bold">{job.salary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showDonate && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#003366] font-montserrat">
                    Выберите получателя:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {users
                      .filter((u) => u.user_id !== user.id)
                      .map((user, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedReceiver(user)}
                          className={`border p-4 rounded-lg cursor-pointer ${
                            selectedReceiver?.user_id === user.user_id
                              ? "border-[#003366]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {user.photo_url && (
                              <img
                                src={user.photo_url}
                                alt={`${user.name} фото`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>{user.name}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {selectedReceiver && (
                    <div className="space-y-4">
                      <input
                        type="number"
                        value={donateAmount}
                        onChange={(e) => setDonateAmount(e.target.value)}
                        placeholder="Сумма доната"
                        className="w-full p-2 border rounded-lg"
                      />
                      <button
                        onClick={handleDonate}
                        className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004488] w-full"
                      >
                        Отправить донат
                      </button>
                    </div>
                  )}
                </div>
              )}

              {showShop && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowAddProduct(!showAddProduct)}
                    className="bg-[#ffd700] text-[#003366] px-6 py-2 rounded-lg hover:bg-[#ffed4a] transition-colors w-full"
                  >
                    <i className="fas fa-plus-circle mr-2"></i>
                    Добавить товар
                  </button>

                  {showAddProduct && (
                    <form
                      onSubmit={handleAddProduct}
                      className="space-y-4 p-4 border rounded-lg"
                    >
                      <input
                        type="text"
                        name="name"
                        placeholder="Название товара"
                        required
                        className="w-full p-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        name="price"
                        placeholder="Цена"
                        required
                        className="w-full p-2 border rounded-lg"
                      />
                      <button
                        type="submit"
                        className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004488] w-full"
                      >
                        Сохранить
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {products
                      .filter((item) =>
                        searchTerm
                          ? item.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          : true
                      )
                      .map((item, index) => (
                        <div key={index} className="border p-4 rounded-lg">
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="text-gray-600">{item.seller_name}</p>
                          <p className="text-[#003366] font-bold">
                            {Number(item.price).toLocaleString()} ₽
                          </p>
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => handleBuyProduct(item)}
                              className="flex-1 bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#004488]"
                            >
                              Купить
                            </button>
                            <button
                              onClick={() => handleChatWithSeller(item)}
                              className="bg-[#ffd700] text-[#003366] px-4 py-2 rounded-lg hover:bg-[#ffed4a]"
                            >
                              <i className="fas fa-comments"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {showInventory && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#003366] font-montserrat">
                    Купленные вещи
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {purchasedItems.length === 0 ? (
                      <div className="col-span-3 text-center text-gray-500 py-8">
                        У вас пока нет купленных товаров
                      </div>
                    ) : (
                      purchasedItems.map((item, index) => (
                        <div
                          key={item.purchase_id || index}
                          className="border p-4 rounded-lg"
                        >
                          <h3 className="font-bold">
                            {item.name || "Название отсутствует"}
                          </h3>
                          <p className="text-gray-600">
                            Куплено у:{" "}
                            {item.seller_name || "Продавец не указан"}
                          </p>
                          <p className="text-[#003366] font-bold">
                            {Number(item.price || 0).toLocaleString()} ₽
                          </p>
                          <button
                            onClick={() => handleSellPurchasedItem(item)}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
                          >
                            <i className="fas fa-undo mr-2"></i>
                            Вернуть (70% стоимости)
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="bg-[#003366] text-white py-8 mt-8 rounded-xl">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4 font-montserrat">
              Особая благодарность
            </h3>
            <div className="flex items-center justify-center space-x-4">
              <img
                src="https://e1a4c9d0d2f9f737c5e1.ucr.io/-/preview/https://api.urlbox.io/v1/NTYqWgJv5s0qDIxN/jpeg?url=https%3A%2F%2Ft.me%2Fvenomaboba11&full_page=true&width=1024&max_height=2048&quality=80"
                alt="Venom"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="font-bold">Venom</p>
                <a
                  href="https://t.me/venomaboba11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ffd700] hover:text-[#ffed4a]"
                >
                  @venomaboba11
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainComponent;
