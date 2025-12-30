import { useMutation, useQueryClient, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';

type QueryKey = string | readonly unknown[];

export interface UseInvalidateMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'onSuccess'> {
  invalidates?: QueryKey[];
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void | Promise<void>;
}

export function useInvalidateMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  options: UseInvalidateMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();
  const { invalidates, onSuccess, ...restOptions } = options;

  return useMutation<TData, TError, TVariables, TContext>({
    ...restOptions,
    onSuccess: async (data, variables, context) => {
      if (onSuccess) {
        await onSuccess(data, variables, context);
      }

      if (invalidates && invalidates.length > 0) {
        await Promise.all(
          invalidates.map((key) => {
            const queryKey = Array.isArray(key) ? key : [key];
            return queryClient.invalidateQueries({ queryKey });
          })
        );
      }
    },
  });
}
