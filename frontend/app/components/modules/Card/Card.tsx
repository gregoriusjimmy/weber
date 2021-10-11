import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../../elements/Button/Button";
import styles from "./Card.module.scss";

type Props = {
  img: string;
  title: string;
  desc: string;
  slug: string;
};

export const Card = ({ img, title, desc, slug }: Props) => {
  return (
    <div className={styles.card}>
      <div className={styles.cover}>
        <Image src={img} width={150} height={150} />
      </div>

      <div className={styles.body}>
        <h3>{title}</h3>
        <p>{desc}</p>
        <div className={styles.footer}>
          <Link href={slug}>
            <Button href={slug} color="secondary">
              Try It Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
