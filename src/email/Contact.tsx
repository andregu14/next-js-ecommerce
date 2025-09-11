import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type ContactEmailProps = {
  name: string;
  email: string;
  message: string;
};

export default function ContactEmail({
  name,
  email,
  message,
}: ContactEmailProps) {
  return (
    <Html lang="pt-BR">
      <Preview>Nova Mensagem de contato</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Nova Mensagem de contato</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                    Nome:
                  </Text>
                  <Text className="mt-0 mr-4">{name}</Text>

                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                    E-mail:
                  </Text>
                  <Text className="mt-0 mr-4">{email}</Text>

                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                    Mensagem:
                  </Text>
                  <Text className="mt-0 mr-4">{message}</Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
