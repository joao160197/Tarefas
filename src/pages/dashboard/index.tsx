import { GetServerSideProps } from "next";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import styles from "./styles.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { Textarea } from "../../components/textarea";
import { IoIosShareAlt } from "react-icons/io";
import { BsTrashFill } from "react-icons/bs";
import Link from "next/link";
import { db } from "../../services/firebaseconection";
import {
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  deleteDoc
} from "firebase/firestore";

interface HomeProps {
  user: {
    email: string;
  };
}

//serve para dizer quais sao os objetos que sao permitidos serem colocados na nossa lista
interface TeskProps {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: HomeProps) {
  const [input, setInput] = useState("");
  const [publictask, setPublictask] = useState(false);
  const [tesks, SetTesks] = useState<TeskProps[]>([]);

  useEffect(() => {
    async function LoadTarefas() {
      const tarefasRef = collection(db, "tasks");
      const q = query(
        tarefasRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      );
      //lista que pega todos os dados do banco de dados la do firebase
      onSnapshot(q, (snapshot) => {
        let lista = [] as TeskProps[];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            tarefa: doc.data().tasks,
            created: doc.data().created,
            user: doc.data().user,
            public: doc.data().public,
          });
        });

        SetTesks(lista);
      });
    }
    LoadTarefas();
  }, [user?.email]);

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    setPublictask(event.target.checked);
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (input === "") return;
    try {
      await addDoc(collection(db, "tasks"), {
        tasks: input,
        created: new Date(),
        user: user?.email,
        public: publictask,
      });

      setInput("");
      setPublictask(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function Share(id:string){
     await navigator.clipboard.writeText(`
     ${process.env.NEXT_PUBLIC_URL}/task/${id}
     `)
     alert("URL COPIADA COM SUCESSO!")
  }

  async function Delete(id:string){
    const docRef = doc(db,"tasks",id)
    await deleteDoc(docRef);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu Painel de Tarefas</title>
      </Head>
      <main>
        <section className={styles.content}>
          <div className={styles.contentform}>
            <h1 className={styles.title}>Qual é a sua tarefa? </h1>
            <form onSubmit={handleRegister}>
              <Textarea
                placeholder="Digite sua tarefa..."
                value={input}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(event.target.value)
                }
              />
              <div className={styles.checkboxarea}>
                <input
                  title="button"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publictask}
                  onChange={handleChangePublic}
                />
                <label className={styles.checkboxtext}>
                  Deixar tarefa publica
                </label>
              </div>
              <button type="submit" className={styles.submit}>
                Registrar
              </button>
            </form>
          </div>
        </section>
        <section className={styles.teskcontainer}>
          <h1 className={styles.title2}>Minhas Tarefas</h1>
          {tesks.map((item) => (
            <article key={item.id} className={styles.task}>
              {item.public && (
                <div className={styles.tagcontainer}>
                  <label className={styles.tag}>PUBLICO</label>
                  <button title="buttonShare" onClick={()=> Share(item.id)} className={styles.share}>
                    <IoIosShareAlt color="#1E90FF" size={23} />
                  </button>
                </div>
              )}
              <div className={styles.teskcontent}>
                {item.public ? (
                  <Link className={styles.Link} href={`/task/${item.id}`}>
                    <p>{item.tarefa}</p>
                  </Link>
                ) : (
                  <p>{item.tarefa}</p>
                )}

                <button title="buttonDelete" onClick={()=>Delete(item.id)} className={styles.trash}>
                  <BsTrashFill color="#d12c2c" size={23} />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};
