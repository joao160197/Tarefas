import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { db } from "../../services/firebaseconection";
import { BsTrashFill } from "react-icons/bs";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { Textarea } from "../../components/textarea";
import { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";

interface TaskProps {
  item: {
    tarefa: string;
    created: string;
    public: boolean;
    taskid: string;
    user: string;
  };
  allComents: ComentsProps[];
}

interface ComentsProps {
  comment: string;
  id: string;
  name: string;
  task: string;
  user: string;
}

export default function Task({ item, allComents }: TaskProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<ComentsProps[]>(allComents || []);

  async function Handlecomment(event: FormEvent) {
    event.preventDefault();
    if (input === "") return;

    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const docRaf = await addDoc(collection(db, "comments"), {
        created: new Date(),
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        task: item?.taskid,
      });

      //renderizando comentarios na tela sem precisar dar refresh

      const data = {
        id: docRaf.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        task: item?.taskid,
      };

      setComments((olditems) => [...olditems, data]);
      setInput("");
    } catch (err) {
      console.log(err);
    }
  }

  async function DeleteButton(id: string) {
    try {
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);

      const DeleteComments = comments.filter((item) => item.id !== id);

      setComments(DeleteComments);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da Tarefa</title>
      </Head>
      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>
      </main>
      <section className={styles.comentariosContainer}>
        <h2>Fazer Comentarios</h2>
        <form onSubmit={Handlecomment}>
          <Textarea
            placeholder="Digite aqui seu comentário..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(event.target.value)
            }
          />
          <button
            type="submit"
            disabled={!session?.user}
            className={styles.comentbutton}
          >
            Enviar Comentário
          </button>
        </form>
      </section>
      <section className={styles.comentariosContainer}>
        <h2>Todos os Comentários</h2>
        {comments.length === 0 && <span>Nenhum Comentario</span>}
        {comments.map((item) => (
          <article key={item.id} className={styles.comment}>
            <div className={styles.HeadComment}>
              <label className={styles.CommentLabel}>{item.name}</label>
              {item.user === session?.user?.email && (
                <button
                  type="button"
                  title="Deletar Comentario"
                  className={styles.trashButton}
                  onClick={() => DeleteButton(item.id)}
                >
                  <BsTrashFill color="#d12c2c" size={23} />
                </button>
              )}
            </div>
            <p className={styles.paragrafo}>{item.comment}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "tasks", id);

  const snapshot = await getDoc(docRef);

  const q = query(collection(db, "comments"), where("task", "==", id));

  const snapshotComments = await getDocs(q);

  let allComents: ComentsProps[] = [];
  snapshotComments.forEach((doc) => {
    allComents.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      task: doc.data().task,
    });
  });

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  const millieseconds = snapshot.data()?.created?.seconds * 1000;

  const task = {
    tarefa: snapshot.data()?.tasks,
    public: snapshot.data()?.public,
    created: new Date(millieseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    id: id,
    taskid: id,
  };

  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  console.log(task);

  return {
    props: {
      item: task,
      allComents: allComents,
    },
  };
};
