import { useEffect, useRef, useState } from "react";
import './App.css';

export default function PostDetail() {
    const [data, setData] = useState([]);    
    const [commentData, setCommentData] = useState([]);
    const [refresh, setRefresh] = useState(false); 
    const [error, setError] = useState(null);
    const formRef = useRef(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function getData() {
            try {
                const response = await fetch("http://localhost:3000/api/posts");
                const postsData = await response.json();
                setData(postsData); 
            } catch (e) {
                setError("Veri yüklenirken hata oluştu.");
            } finally {
                setTimeout(() => {
                    setIsLoading(false); 
                }, 2000);
            }
        }

        async function getCommentData() {
            try {
                const response = await fetch("http://localhost:3000/api/comments");
                const commentData = await response.json();
                setCommentData(commentData); 
            } catch (e) {
                setError("Veri yüklenirken hata oluştu.");
            } finally {
                setTimeout(() => {
                    setIsLoading(false); 
                }, 2000);
            }
        }
        
        getData();
        getCommentData();
    }, [refresh]);

    const handleAddNewCommentForm = async (e) => {
        e.preventDefault();
        const formObj = Object.fromEntries(new FormData(e.target));
        const postId = Number( e.target.getAttribute("data-post-id"));
    
        
        if (!formObj.content || formObj.content.trim() === "") {
            setError("Yorum boş olamaz.");
            return;
        }
    
        const newComment = {
            ...formObj,
            postId : postId 
        };

        try {
            const response = await fetch("http://localhost:3000/api/comments", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(newComment),
            });
           
            if (response.ok) {
                setRefresh(!refresh); 
                formRef.current.reset(); 
                setError(null); 
            } else {
                setError("Yorum eklenirken bir hata oluştu.");
            }
        } catch (e) {
            console.error("Fetch Hatası:", e);
            setError("Yorum eklenirken bir hata oluştu.");
        }
    };

    // Yeni post ekleme işlemi
    const handleNewPostForm = async (e) => {
        e.preventDefault();
        const formObj = Object.fromEntries(new FormData(e.target));

        try {
            const response = await fetch("http://localhost:3000/api/posts", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(formObj),
            });

            if (response.ok) {
                const newData = await response.json();
                setData((prevData) => [...prevData, newData]); 
                setShowAddForm(false); 
                setError(null); 
            } else {
                setError("Yeni post eklenirken hata oluştu.");
            }
        } catch (e) {
            setError("Yeni post eklenirken hata oluştu.");
        }
    };

    const handleLikeBtn = async (e) => {
        e.preventDefault();
        const commentId = e.target.value;
        const response = await fetch(`http://localhost:3000/api/comments/${commentId}?like=true`);

        if (!response.ok) {
            setError("Like işlemi başarısız.");
            return;
        }

        setRefresh(!refresh); 
    };

    const handleDislikeBtn = async (e) => {
        e.preventDefault();
        const commentId = e.target.value;
        const response = await fetch(`http://localhost:3000/api/comments/${commentId}?dislike=true`);

        if (!response.ok) {
            setError("Like işlemi başarısız.");
            return;
        }

        setRefresh(!refresh); 
    };

    return (
        <div>
            {isLoading ? (
                <div>Yükleniyor...</div>
            ) : (
              <>
                 <button onClick={() => setShowAddForm(true)}>Yeni Yazı Ekle</button>
                <div className="container">
                   
                    {showAddForm && (
                        <>
                            <button onClick={() => setShowAddForm(false)}>Vazgeç</button>
                            <form onSubmit={handleNewPostForm}>
                                <input type="text" name="title" placeholder="Yazı Başlığı" /> <br />
                                <textarea name="content" placeholder="Yazı İçeriği"></textarea> <br />
                                <button>Yazıyı Kaydet</button>
                            </form>
                        </>
                    )}

                    {error && <small>{error}</small>}

                    {/* Postlar ve yorumlar */}
                    {data.map((post) => (
                        <div key={post.id} className="post">
                            <h1>{post.title}</h1>
                            <p>{post.content}</p>

                            {/* Yorum Ekleme Formu */}
                            <form ref={formRef} data-post-id={post.id} onSubmit={handleAddNewCommentForm}>
                                <textarea name="content" placeholder="Yorumunuz"></textarea> <br />
                                <button>Yorumu Gönder</button>
                            </form>
                         
                            {/* Yorumları Gösterme */}
                            <div className="comments-section">
                                {commentData
                                    .filter((comment) => comment.postId === post.id) 
                                    .map((comment, index) => (
                                        <div key={index} className="comment">
                                            <span>{comment.content}</span>
                                            <button onClick={handleLikeBtn} value={comment.id}>
                                                Like {comment.likes}
                                            </button>
                                            <button onClick={handleDislikeBtn} value={comment.id}>Dislike {comment.dislikes}</button>
                                        </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
              
              </>
            )}
        </div>
    );
}



