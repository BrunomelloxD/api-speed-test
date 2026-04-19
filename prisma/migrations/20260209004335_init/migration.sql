-- CreateTable
CREATE TABLE "public"."niveis" (
    "id" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,

    CONSTRAINT "niveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profissionais" (
    "id" TEXT NOT NULL,
    "nivel_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "hobby" TEXT NOT NULL,

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."profissionais" ADD CONSTRAINT "profissionais_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
