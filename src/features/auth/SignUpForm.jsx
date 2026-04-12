import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { signUp } from "@/src/services/authService.js";
import { UserContext } from "@/src/app/UserContext.jsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const MIN_PASSWORD_LENGTH = 8;

const signUpSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(
        MIN_PASSWORD_LENGTH,
        `Use at least ${MIN_PASSWORD_LENGTH} characters`
      ),
    passwordConf: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConf, {
    message: "Passwords must match",
    path: ["passwordConf"],
  });

const SignUpForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConf: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data) => {
    form.clearErrors("root");
    try {
      const newUser = await signUp(data);
      setUser(newUser);
      navigate("/explore/exercises");
    } catch (err) {
      form.setError("root", { type: "server", message: err.message });
    }
  };

  return (
    <div className="signup-page h-full py-[15vh]">
      <div className="signup-container w-full flex justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>
              Create an account to save workouts and plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {form.formState.errors.root && (
              <p className="text-destructive mb-4 text-sm" role="alert">
                {form.formState.errors.root.message}
              </p>
            )}

            <form
              id="signup-form"
              className="space-y-0"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <FieldGroup className="gap-6">
                <Controller
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-username">Username</FieldLabel>
                      <Input
                        {...field}
                        id="signup-username"
                        autoComplete="username"
                        placeholder="username"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                      <Input
                        {...field}
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        aria-invalid={fieldState.invalid}
                        onChange={(e) => {
                          field.onChange(e);
                          void form.trigger("passwordConf");
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="passwordConf"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-password-conf">
                        Confirm password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="signup-password-conf"
                        type="password"
                        autoComplete="new-password"
                        placeholder="repeat password"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Field className="w-full flex flex-row flex-wrap gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="signup-form"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing up…" : "Sign up"}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUpForm;