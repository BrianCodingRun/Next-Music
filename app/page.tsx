"use client"
import Section from "@/components/Section";
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { useState } from "react";


export default function Home() {
  const { data: session }: any = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const login = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        signIn('spotify', { callbackUrl: '/dashboard' })
        .then((data) => {
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          console.log(error);
        });
        
      } catch (error) {
        console.log(error);      
      }
    }, 1000);
  }

  return (
    <>
      <Section className="py-20 flex justify-center">
        <Alert className="w-[500px] max-w-full space-y-2">
          <AlertTitle className="text-center text-2xl font-bold">Informations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-3 text-neutral-300">
              <li>Cette application a été faites pour des fins éducatives et de démonstration. Elle n'est pas destinée à être utilisée en production.</li>
              <li>
                Veuillez noter que pour utiliser cette application, vous devez disposer d'un compte Spotify et que vous avez autorisé l'accès à votre compte.
              </li>
              <li>
                La lecture d'une piste audio require un compte Spotify Premium.
              </li>
              <li>
                Pour plus d'informations sur les APIs utilisées, veuillez consulter le fichier README.md.
              </li>
            </ul>
          </AlertDescription>
          {/* Bouton pour se connecter */}
          <div className="flex justify-start py-4">
            {
              session && session.accessToken ? (
                <Button className="font-sans border-none" onClick={() => router.push('/dashboard')}>Accéder au tableau de bord</Button>
              ) : (
                <Button className="font-sans border-none" onClick={() => login()}>
                  {
                    isLoading ? (
                      <Loader />
                    ) : (
                      "Se connecter"
                    )
                  }
                </Button>
              )
            }
          </div>
        </Alert>
      </Section>
      <footer className="fixed bottom-0 left-0 w-full py-3 flex justify-center">
        <p className="text-center text-xs text-neutral-400">
          Développé avec ❤️ par <a href="https://briancoupama.re" target="_blank" rel="noopener noreferrer">Brian Coupama</a>
        </p>
      </footer>
    </>
  )
}
