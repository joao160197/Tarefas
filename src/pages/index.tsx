import Head from 'next/head'
import styles from '../styles/home.module.css'
import Image from 'next/image'
import Logo from '../../public/assets/logo.png'
import { GetStaticProps } from 'next'
import { getDocs, collection } from "firebase/firestore";
import {db} from '../services/firebaseconection';

interface HomeProps{
  posts: number;
  comments: number;
}

export default function Home({comments,posts}:HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas + Organização de Tarfas</title>
      </Head>
      <main className={styles.main}>
      <div className={styles.logo}>
      <Image className={styles.hero} src={Logo} alt='Logo' priority/>
      </div>
      <h1 className={styles.title}>Sistema feito para você organizar  <br/> seus estudos e terefas</h1>
      <div className={styles.infocontent}>
        <section className={styles.textbox}>
          <span>
          +{posts} post 
          </span>
        </section>
        <section className={styles.textbox}>
          <span>
          +{comments} comentarios 
          </span>
        </section>
      </div>
     </main>
    </div>
  )
}


export const getStaticProps:GetStaticProps = async () => {

  const commentRef = collection(db,"comments");
  const postRef = collection(db,"tasks");


  const commentsSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);


  return{
    props:{
    posts:postSnapshot.size || 0,
    comments: commentsSnapshot.size || 0
    },
    revalidate: 60, //revalida a pagina a cada 60 segundos
  };
};