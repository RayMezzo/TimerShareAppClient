'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';  // Next.jsのuseRouterをインポート
import styles from './TimerClient.module.css'; // CSSファイルを読み込む

//import CustomHead from '../components/head'; 

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  const handleJoinRoom = () => {
    if (roomId) {
      router.push(`/room/${roomId}`);  // roomIdをURLの一部として遷移
    }
  };

  return (
    <>
    
    <div className={styles.container}>
      <h1 className={styles.title}>Work With Me.</h1>
      <p>友達とルームIDを共有してタイマーを管理しよう！</p>

      <div className={styles.joinForm}>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="ルームIDを入力"
          className={styles.input}
        />
        <button onClick={handleJoinRoom} className={styles.joinButton}>
          Join Room
        </button>
      </div>
    </div>
    </>
  );
}
