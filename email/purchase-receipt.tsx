//`react-email` package is for creating email templates in React... `@react-email/components` package is a set of pre-built components for creating email templates.
import { Body, Column, Container, Head,  Heading, Html, Img, Preview, Row, Section, Tailwind, Text } from '@react-email/components';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/lib/validator';
import 'dotenv/config';     //using env vars outside of the main app folder, we need to import the `dotenv/config` module.
  

// PurchaseReceiptEmail component, used as an email template, receives the order data as a prop
export default function PurchaseReceiptEmail({ order }: {order: Order}) { 
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });  // `dateFormatter` object to format the order date
  return (
    <Html>
      <Preview>View order receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>
            <Section>
              {/* display order details in a row */}
              <Row>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4"> Order ID </Text>
                  <Text className="mt-0 mr-4">{order.id.toString()}</Text>
                </Column>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4"> Purchased On </Text>
                  <Text className="mt-0 mr-4"> {dateFormatter.format(order.createdAt)} </Text>
                </Column>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4"> Price Paid </Text>
                  <Text className="mt-0 mr-4"> {formatCurrency(order.totalPrice)} </Text>
                </Column>
              </Row>
            </Section>

            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {/* map over orderItems & display them */}
              {order.orderItems.map((item) => (
                <Row key={item.productId} className="mt-8">
                  <Column className="w-20">
                    <Img src={ item.image.startsWith("/") ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}` : item.image } width="80" alt={item.name} className="rounded" />
                  </Column>
                  <Column className="align-top">
                    <Text className="mx-2 my-0"> {item.name} x {item.qty} </Text>
                  </Column>
                  <Column align="right" className="align-top">
                    <Text className="m-0 ">{formatCurrency(item.price)}</Text>
                  </Column>
                </Row>
              ))}
              {/* create an array of objects of (subtotal, tax, shipping & total), map over & display them */}
              {[{ name: "Items", price: order.itemsPrice }, { name: "Tax", price: order.taxPrice },
                { name: "Shipping", price: order.shippingPrice }, { name: "Total", price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className="py-1">
                  <Column align="right">{name}:</Column>
                  <Column align="right" width={70} className="align-top">
                    <Text className="m-0">{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}