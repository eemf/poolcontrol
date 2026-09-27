      'use server';

      /**
       * @fileOverview Personalized offer recommendations based on customer purchase history and table usage.
       *
       * - getPersonalizedOfferRecommendations - A function that generates personalized offer recommendations.
       * - PersonalizedOfferRecommendationsInput - The input type for the getPersonalizedOfferRecommendations function.
       * - PersonalizedOfferRecommendationsOutput - The return type for the getPersonalizedOfferRecommendations function.
       */
      
      import {ai} from '@/ai/genkit';
      import {z} from 'genkit';
      
      const RecomendacionesOfertasPersonalizadasInputSchema = z.object({
        customerPurchaseHistory: z
          .string()
          .describe('The purchase history of the customer.'),
        tableUsage: z.string().describe('The table usage history of the customer.'),
      });
      export type RecomendacionesOfertasPersonalizadasInput = z.infer<
        typeof RecomendacionesOfertasPersonalizadasInputSchema
      >;
      
      const RecomendacionesOfertasPersonalizadasOutputSchema = z.object({
        offerRecommendations: z
          .string()
          .describe('Personalized offer recommendations for the customer.'),
      });
      export type RecomendacionesOfertasPersonalizadasOutput = z.infer<
        typeof RecomendacionesOfertasPersonalizadasOutputSchema
      >;
      
      export async function obtenerRecomendacionesOfertasPersonalizadas(
        input: RecomendacionesOfertasPersonalizadasInput
      ): Promise<RecomendacionesOfertasPersonalizadasOutput> {
        return recomendacionesOfertasPersonalizadasFlow(input);
      }
      
      const prompt = ai.definePrompt({
        name: 'personalizedOfferRecommendationsPrompt',
        input: {schema: RecomendacionesOfertasPersonalizadasInputSchema},
        output: {schema: RecomendacionesOfertasPersonalizadasOutputSchema},
        prompt: `You are an expert marketing assistant for a pool hall.
        Based on the customer's purchase history and table usage, recommend personalized offers to increase sales and customer engagement.
      
        Purchase History: {{{customerPurchaseHistory}}}
        Table Usage: {{{tableUsage}}}
      
        Recommend offers that are likely to appeal to the customer based on their past behavior.
        Consider offering discounts on products they frequently purchase or table time during their preferred hours.
        Suggest offers that encourage them to try new products or services.
        Format the output as a list of offers.
        `,
      });
      
      const recomendacionesOfertasPersonalizadasFlow = ai.defineFlow(
        {
          name: 'personalizedOfferRecommendationsFlow',
          inputSchema: RecomendacionesOfertasPersonalizadasInputSchema,
          outputSchema: RecomendacionesOfertasPersonalizadasOutputSchema,
        },
        async input => {
          const {output} = await prompt(input);
          return output!;
        }
      );
