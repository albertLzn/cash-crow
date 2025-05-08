import { v4 as uuidv4 } from 'uuid';
import { Template, OrderTemplate } from '../models/Template';
import { Order, OrderGroup, PaymentMethod } from '../models/Order';
import { AlgorithmSettings } from '../models/DailyReport';
import { cloneDeep } from 'lodash';

/**
 * Interface pour les résultats de la distribution
 */
interface DistributionResult {
  orders: Order[];
  orderGroups: OrderGroup[];
}

/**
 * Distribue un montant total en commandes individuelles basées sur un template
 */
export const distributeAmount = async (
  targetAmount: number,
  template: Template,
  paymentMethod: 'cash' | 'card' | 'both',
  settings: AlgorithmSettings
): Promise<DistributionResult> => {
  // Cloner le template pour ne pas le modifier
  const templateCopy = cloneDeep(template);
  
  // Trouver le montant minimum dans le template pour établir une limite inférieure
  const minAmount = Math.min(...templateCopy.orders.map(order => order.amount));
  
  // Normaliser les fréquences dans le template
  const totalFrequency = templateCopy.orders.reduce((sum, order) => sum + order.frequency, 0);
  templateCopy.orders.forEach(order => {
    order.frequency = order.frequency / totalFrequency;
  });
  
  // Déterminer le nombre approximatif de commandes basé sur la valeur moyenne des commandes
  const avgOrderValue = templateCopy.orders.reduce(
    (sum, order) => sum + order.amount * order.frequency, 
    0
  );
  
  let estimatedOrderCount = Math.round(targetAmount / avgOrderValue);
  
  // Ajuster le nombre de commandes avec un facteur de variation
  let randomVariation = 0;
  if (settings.variationFactor > 0) {
    const variationRange = Math.floor(estimatedOrderCount * settings.variationFactor);
    randomVariation = Math.floor(Math.random() * (variationRange * 2 + 1)) - variationRange;
  }
  estimatedOrderCount = Math.max(1, estimatedOrderCount + randomVariation);
  
  // Distribuer les commandes
  const orderGroups: OrderGroup[] = [];
  let remainingAmount = targetAmount;
  let iterations = 0;
  
  while (remainingAmount > 0 && iterations < settings.maxIterations) {
    iterations++;
    
    // Sélectionner un type de commande basé sur sa fréquence
    let selectedOrder: OrderTemplate;
    
    if (settings.variationFactor === 0) {
      // En mode strict, privilégier les commandes qui correspondent exactement au montant restant
      const exactMatch = templateCopy.orders.find(order => 
        Math.abs(order.amount - remainingAmount) < 0.01
      );
      
      if (exactMatch) {
        selectedOrder = exactMatch;
      } else {
        // Chercher la plus grande commande qui ne dépasse pas le montant restant
        const validOrders = templateCopy.orders.filter(o => o.amount <= remainingAmount);
        if (validOrders.length > 0) {
          // Trier par montant décroissant et prendre le premier
          selectedOrder = [...validOrders].sort((a, b) => b.amount - a.amount)[0];
        } else {
          // Si aucune commande ne convient, prendre la plus petite
          selectedOrder = [...templateCopy.orders].sort((a, b) => a.amount - b.amount)[0];
        }
      }
    } else if (settings.preferExactMatch && iterations === 1) {
      // Chercher une commande qui correspond exactement au montant restant
      const exactMatch = templateCopy.orders.find(order => 
        Math.abs(order.amount - remainingAmount) < 0.01
      );
      
      if (exactMatch) {
        selectedOrder = exactMatch;
      } else {
        selectedOrder = weightedRandomSelection(templateCopy.orders);
      }
    } else {
      selectedOrder = weightedRandomSelection(templateCopy.orders);
    }
    let orderPaymentMethod: PaymentMethod;
if (selectedOrder.paymentMethod) {
  // Utiliser la méthode de paiement de la commande du template
  orderPaymentMethod = selectedOrder.paymentMethod;
} else if (paymentMethod === 'both') {
  // Si pas définie dans le template et mode 'both', distribuer aléatoirement
  orderPaymentMethod = Math.random() < 0.5 ? 'cash' : 'card';
} else {
  // Sinon utiliser la méthode demandée
  orderPaymentMethod = paymentMethod as PaymentMethod;
}
    
    // Appliquer une variance au montant de la commande seulement si le facteur n'est pas 0
    let orderAmount = selectedOrder.amount;
    if (settings.variationFactor > 0) {
      const varianceFactor = settings.variationFactor * 2;
      const maxVariance = selectedOrder.amount * varianceFactor;
      const variance = (Math.random() * 2 - 1) * maxVariance;
      orderAmount = Math.max(minAmount, roundToDecimal(selectedOrder.amount + variance, settings.roundingPrecision));
    }
    
    // Si le montant est supérieur au montant restant, ajuster
    if (orderAmount > remainingAmount) {
      if (settings.variationFactor === 0) {
        // En mode strict, chercher une commande exacte dans le template
        const smallerOrder = templateCopy.orders
          .filter(o => o.amount <= remainingAmount)
          .sort((a, b) => b.amount - a.amount)[0];
          
        if (smallerOrder) {
          orderAmount = smallerOrder.amount;
        } else if (orderGroups.length > 0) {
          // Ajouter le reste à une commande existante
          const randomGroupIndex = Math.floor(Math.random() * orderGroups.length);
          orderGroups[randomGroupIndex].amount = roundToDecimal(
            orderGroups[randomGroupIndex].amount + remainingAmount,
            settings.roundingPrecision
          );
          break;
        } else {
          orderAmount = roundToDecimal(remainingAmount, settings.roundingPrecision);
        }
      } else if (settings.allowNewOrderTypes || remainingAmount >= minAmount) {
        // Mode avec variation: créer un nouveau montant
        const range = remainingAmount - minAmount;
        if (range <= 0) {
          orderAmount = minAmount;
        } else {
          orderAmount = roundToDecimal(minAmount + Math.random() * range, settings.roundingPrecision);
        }
      } else {
        // Si le montant restant est inférieur au minimum, l'ajouter à une commande existante
        if (orderGroups.length > 0) {
          const randomGroupIndex = Math.floor(Math.random() * orderGroups.length);
          orderGroups[randomGroupIndex].amount = roundToDecimal(
            orderGroups[randomGroupIndex].amount + remainingAmount,
            settings.roundingPrecision
          );
          break;
        } else {
          // Cas extrême: forcer un montant égal au restant
          orderAmount = roundToDecimal(remainingAmount, settings.roundingPrecision);
        }
      }
    }
    
    // Mettre à jour le montant restant
    remainingAmount = roundToDecimal(remainingAmount - orderAmount, settings.roundingPrecision);
    
    // Gérer les erreurs d'arrondi qui pourraient laisser un très petit montant restant
    if (remainingAmount > 0 && remainingAmount < 0.01) {
      remainingAmount = 0;
    }
    
    // Ajouter ou mettre à jour le groupe de commandes
    const existingGroupIndex = orderGroups.findIndex(
      g => Math.abs(g.amount - orderAmount) < 0.01 && g.paymentMethod === orderPaymentMethod
    );
    
    if (existingGroupIndex >= 0) {
      orderGroups[existingGroupIndex].count++;
    } else {
      orderGroups.push({
        amount: orderAmount,
        count: 1,
        paymentMethod: orderPaymentMethod,
        description: selectedOrder.description
      });
    }
  }
  
  // Vérifier si nous avons des commandes
  if (orderGroups.length === 0) {
    // Cas d'erreur: aucune commande générée
    orderGroups.push({
      amount: targetAmount,
      count: 1,
      paymentMethod: paymentMethod === 'both' ? 'cash' : paymentMethod,
      description: "Commande générée automatiquement"
    });
  }
  
  // Générer les commandes individuelles à partir des groupes
  const orders: Order[] = [];
  const now = new Date();
  const baseTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
  
  // Répartir les commandes sur une journée de travail (8h - 20h)
  const workDayMinutes = 12 * 60;
  
  orderGroups.forEach(group => {
    for (let i = 0; i < group.count; i++) {
      // Répartir les commandes de manière aléatoire dans la journée
      const randomMinutes = Math.floor(Math.random() * workDayMinutes);
      const orderTime = new Date(baseTimestamp.getTime() + randomMinutes * 60000);
      
      orders.push({
        id: uuidv4(),
        amount: group.amount,
        timestamp: orderTime.toISOString(),
        paymentMethod: group.paymentMethod,
        description: group.description
      });
    }
  });
  
  // Trier les commandes par horodatage
  orders.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  return { orders, orderGroups };
};

/**
 * Sélectionne un élément aléatoirement en fonction de sa pondération (fréquence)
 */
function weightedRandomSelection<T extends { frequency: number }>(items: T[]): T {
  if (!items || items.length === 0) {
    throw new Error("Impossible de sélectionner à partir d'une liste vide");
  }
  
  const totalWeight = items.reduce((sum, item) => sum + item.frequency, 0);
  if (totalWeight <= 0) {
    return items[0]; // Fallback si toutes les fréquences sont nulles
  }
  
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.frequency;
    if (random <= 0) {
      return item;
    }
  }
  
  // Fallback au cas où (ne devrait jamais arriver)
  return items[0];
}

/**
 * Arrondit un nombre à un nombre spécifique de décimales
 */
function roundToDecimal(value: number, decimals: number): number {
  if (isNaN(value)) return 0;
  if (decimals < 0) decimals = 0;
  
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}